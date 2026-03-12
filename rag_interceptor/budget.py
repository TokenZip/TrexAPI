"""Budget controller for the TZP RAG Interceptor.

Prevents a single process() call from pulling too many payloads,
embedding too many chunks, or injecting too many tokens.
"""

from __future__ import annotations

import logging

from .models import BudgetConfig, TagMatch

logger = logging.getLogger(__name__)


class BudgetExceeded(Exception):
    """Raised internally when a hard limit is hit (informational only)."""


class BudgetController:
    """Stateless guardrail that trims inputs to stay within budget."""

    def __init__(self, config: BudgetConfig) -> None:
        self._cfg = config

    # -- tag level ----------------------------------------------------------

    def check_tag_limit(self, tags: list[TagMatch]) -> list[TagMatch]:
        """Return at most max_tzp_tags tags; log if truncated."""
        limit = self._cfg.max_tzp_tags
        if len(tags) <= limit:
            return tags
        logger.warning(
            "Tag budget exceeded: %d tags found, keeping first %d",
            len(tags), limit,
        )
        return tags[:limit]

    # -- chunk level --------------------------------------------------------

    def check_chunk_limit(self, chunks: list[str]) -> list[str]:
        limit = self._cfg.max_total_chunks
        if len(chunks) <= limit:
            return chunks
        logger.warning(
            "Chunk budget exceeded: %d chunks, keeping first %d",
            len(chunks), limit,
        )
        return chunks[:limit]

    # -- fallback text level ------------------------------------------------

    def check_fallback_text(self, text: str) -> str:
        limit = self._cfg.max_total_fallback_chars
        if len(text) <= limit:
            return text
        logger.warning(
            "Fallback text budget exceeded: %d chars, truncating to %d",
            len(text), limit,
        )
        return text[:limit]

    # -- embedding level ----------------------------------------------------

    def check_embedding_budget(
        self, texts: list[str], cached_count: int = 0
    ) -> tuple[list[str], bool]:
        """Check whether embedding *texts* would exceed the budget.

        Returns (allowed_texts, should_downgrade).
        *should_downgrade* is True when the caller should fall back to
        vector-only retrieval instead of re-embedding.
        """
        remaining = self._cfg.max_total_embedding_texts - cached_count
        if remaining <= 0:
            logger.warning("Embedding budget exhausted (cached=%d), downgrading", cached_count)
            return [], True
        if len(texts) <= remaining:
            return texts, False
        logger.warning(
            "Embedding budget exceeded: %d texts (cached=%d), keeping %d",
            len(texts), cached_count, remaining,
        )
        return texts[:remaining], False

    # -- injection level ----------------------------------------------------

    def truncate_injection(self, chunks: list[str]) -> list[str]:
        """Trim chunks to fit within max_inject_tokens (approximate)."""
        budget_words = int(self._cfg.max_inject_tokens * 0.75)
        result: list[str] = []
        total = 0
        for chunk in chunks:
            words = chunk.split()
            if total + len(words) > budget_words:
                remaining = budget_words - total
                if remaining > 0:
                    result.append(" ".join(words[:remaining]))
                break
            result.append(chunk)
            total += len(words)
        return result
