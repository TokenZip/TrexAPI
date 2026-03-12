"""TZP RAG Interceptor — 6-phase pipeline.

Phase 1  Parse       detect [TZP: ...] markers
Phase 2  Pull        deduplicate, cache-aware parallel fetch
Phase 3  Materialize decompress, chunk, build/reuse index, determine tier
Phase 4  Retrieve    query top-k with budget control
Phase 5  Inject      format context blocks, truncate
Phase 6  Failsafe    handle errors per ErrorMode

Implements TZP v1.0 Specification Section 4.4.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from .budget import BudgetController
from .cache import InterceptorCache
from .models import (
    ErrorMode,
    InterceptorConfig,
    RetrievalResult,
    RetrievalTier,
    TagMatch,
    TrexPullError,
    TZPPayload,
)
from .parser import extract_tzp_tags, replace_tzp_tags, strip_escaped_markers
from .retriever import TZPRetriever
from .trex_client import TrexClient

logger = logging.getLogger(__name__)


class TZPInterceptor:
    """Main interceptor that processes TZP markers in prompts.

    Usage::

        from rag_interceptor.config import build_config

        config = build_config(api_key="...", embedding_model="bge-m3")
        async with TZPInterceptor(config) as interceptor:
            processed = await interceptor.process(prompt, user_query)
    """

    def __init__(self, config: InterceptorConfig) -> None:
        self._config = config
        self._cache = InterceptorCache()
        self._client = TrexClient(config.trex, cache=self._cache)
        self._budget = BudgetController(config.budget)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def process(self, prompt: str, user_query: str) -> str:
        """Full 6-phase pipeline: detect → pull → materialize → retrieve → inject → failsafe."""

        # Phase 1: Parse
        prompt = strip_escaped_markers(prompt)
        tags = extract_tzp_tags(prompt)
        if not tags:
            return prompt

        tags = self._budget.check_tag_limit(tags)
        trex_ids = list(dict.fromkeys(t.trex_id for t in tags))
        logger.info("Phase 1 (Parse): %d tag(s) → %s", len(tags), trex_ids)

        # Phase 2: Pull
        pull_results = await self._client.pull_many(trex_ids)
        payloads: dict[str, TZPPayload] = {}
        errors: dict[str, str] = {}
        for r in pull_results:
            if isinstance(r, TrexPullError):
                errors[r.trex_id] = r.error_code
            else:
                payloads[r.trex_id] = r
        logger.info("Phase 2 (Pull): %d ok, %d errors", len(payloads), len(errors))

        # Phase 3 + 4: Materialize & Retrieve (per payload)
        retrieval_map: dict[str, RetrievalResult] = {}
        for trex_id, payload in payloads.items():
            try:
                rr = await self._materialize_and_retrieve(payload, user_query)
                retrieval_map[trex_id] = rr
            except Exception as exc:
                logger.exception("Retrieval failed for %s", trex_id)
                errors[trex_id] = f"RETRIEVAL_FAILED: {exc}"

        # Phase 5: Inject
        replacements = self._build_replacements(retrieval_map, errors, tags)

        # Phase 6: Failsafe (handled inside _build_replacements via ErrorMode)
        return replace_tzp_tags(prompt, tags, replacements)

    # ------------------------------------------------------------------
    # Phase 3: Materialize
    # ------------------------------------------------------------------

    async def _materialize_and_retrieve(
        self, payload: TZPPayload, user_query: str
    ) -> RetrievalResult:
        retriever = TZPRetriever(
            payload=payload,
            rag_config=self._config.rag,
            chunk_config=self._config.chunk,
            cache=self._cache,
        )

        docs = await asyncio.to_thread(retriever.invoke, user_query)

        chunks = [doc.page_content for doc in docs]
        scores = [doc.metadata.get("score", 0.0) for doc in docs]
        tier_val = docs[0].metadata.get("retrieval_tier", RetrievalTier.VECTOR_ONLY) if docs else RetrievalTier.VECTOR_ONLY
        em = docs[0].metadata.get("embedding_model", "") if docs else ""

        chunks = self._budget.truncate_injection(chunks)

        return RetrievalResult(
            trex_id=payload.trex_id,
            chunks=chunks,
            tier=tier_val if isinstance(tier_val, RetrievalTier) else RetrievalTier(tier_val),
            embedding_model=em,
            chunk_scores=scores[: len(chunks)],
        )

    # ------------------------------------------------------------------
    # Phase 5 + 6: Inject & Failsafe
    # ------------------------------------------------------------------

    def _build_replacements(
        self,
        retrieval_map: dict[str, RetrievalResult],
        errors: dict[str, str],
        tags: list[TagMatch],
    ) -> dict[str, str]:
        replacements: dict[str, str] = {}
        error_mode = self._config.error_mode
        with_label = self._config.inject_with_source_label

        seen_ids = {t.trex_id for t in tags}

        for trex_id in seen_ids:
            if trex_id in errors:
                replacements[trex_id] = self._format_error(trex_id, errors[trex_id], error_mode)
                continue

            rr = retrieval_map.get(trex_id)
            if rr is None or not rr.chunks:
                replacements[trex_id] = self._format_error(
                    trex_id, "NO_RELEVANT_CONTENT", error_mode
                )
                continue

            replacements[trex_id] = self._format_context(trex_id, rr, with_label)

        return replacements

    @staticmethod
    def _format_context(trex_id: str, rr: RetrievalResult, with_label: bool) -> str:
        lines: list[str] = []
        if with_label:
            lines.append(f"[Context from {trex_id}]")
        for chunk in rr.chunks:
            lines.append(f"- {chunk}")
        return "\n".join(lines)

    @staticmethod
    def _format_error(trex_id: str, code: str, mode: ErrorMode) -> str:
        if mode == ErrorMode.PLACEHOLDER:
            return f"[TZP_ERROR: {trex_id}: {code}]"
        if mode == ErrorMode.SILENT_SKIP:
            return ""
        # ErrorMode.SUMMARY
        return f"(Context {trex_id} is temporarily unavailable)"

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    @property
    def cache(self) -> InterceptorCache:
        return self._cache

    async def close(self) -> None:
        await self._client.close()

    async def __aenter__(self) -> TZPInterceptor:
        return self

    async def __aexit__(self, *exc: Any) -> None:
        await self.close()
