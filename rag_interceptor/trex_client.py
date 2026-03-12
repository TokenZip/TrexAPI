"""Async HTTP client for pulling TZP payloads from TrexAPI."""

from __future__ import annotations

import asyncio
from typing import Any

import httpx

from .cache import InterceptorCache
from .models import QuantParams, TrexConfig, TrexPullError, TZPPayload

TREX_NOT_FOUND = "TREX_NOT_FOUND"
TREX_EXPIRED = "TREX_EXPIRED"
TREX_FORBIDDEN = "TREX_FORBIDDEN"
TREX_TIMEOUT = "TREX_TIMEOUT"
TREX_SERVER_ERROR = "TREX_SERVER_ERROR"

_STATUS_TO_ERROR = {
    404: TREX_NOT_FOUND,
    410: TREX_EXPIRED,
    403: TREX_FORBIDDEN,
    401: TREX_FORBIDDEN,
}


def _parse_quant_params(raw: Any) -> list[QuantParams]:
    if isinstance(raw, dict):
        return [QuantParams(min=raw["min"], max=raw["max"],
                            method=raw.get("method", "percentile_99_9_int8"))]
    if isinstance(raw, list):
        return [
            QuantParams(min=p["min"], max=p["max"],
                        method=p.get("method", "percentile_99_9_int8"))
            for p in raw
        ]
    raise ValueError(f"Invalid quant_params format: {type(raw)}")


def _parse_payload(data: dict[str, Any]) -> TZPPayload:
    payload = data["payload"]
    metadata = data.get("metadata", {})
    qp = _parse_quant_params(payload["quant_params"])

    return TZPPayload(
        trex_id=data["trex_id"],
        tzp_version=data.get("tzp_version", "1.0"),
        vector_seq_b64=payload["vector_seq_b64"],
        quant_params=qp,
        dimensions=payload.get("dimensions", 384),
        chunk_count=payload.get("chunk_count", len(payload["vector_seq_b64"])),
        fallback_text_zstd_b64=payload.get("fallback_text_zstd_b64"),
        summary=payload.get("summary"),
        source_lang=payload.get("source_lang"),
        metadata=metadata,
        checksum_sha256=data.get("checksum_sha256", ""),
    )


class TrexClient:
    """Async client for TrexAPI pull operations with optional caching."""

    def __init__(
        self,
        config: TrexConfig,
        cache: InterceptorCache | None = None,
    ) -> None:
        self._config = config
        self._cache = cache
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            headers: dict[str, str] = {}
            if self._config.api_key:
                headers["Authorization"] = f"Bearer {self._config.api_key}"
            self._client = httpx.AsyncClient(
                base_url=self._config.api_base_url,
                headers=headers,
                timeout=self._config.timeout,
            )
        return self._client

    async def pull(self, trex_id: str) -> TZPPayload:
        """Pull a single TZP payload, hitting cache first."""
        if self._cache:
            cached = self._cache.get_payload(trex_id)
            if cached is not None:
                return cached

        client = await self._get_client()
        try:
            resp = await client.get(f"/v1/payloads/{trex_id}")
        except httpx.TimeoutException:
            raise TrexPullError(trex_id, TREX_TIMEOUT, "Request timed out")
        except httpx.HTTPError as exc:
            raise TrexPullError(trex_id, TREX_SERVER_ERROR, str(exc))

        if resp.status_code != 200:
            error_code = _STATUS_TO_ERROR.get(resp.status_code, TREX_SERVER_ERROR)
            raise TrexPullError(trex_id, error_code, f"HTTP {resp.status_code}")

        payload = _parse_payload(resp.json())
        if self._cache:
            self._cache.set_payload(trex_id, payload)
        return payload

    async def pull_many(
        self, trex_ids: list[str]
    ) -> list[TZPPayload | TrexPullError]:
        """Pull multiple payloads in parallel."""
        tasks = [self.pull(tid) for tid in trex_ids]
        results: list[TZPPayload | TrexPullError] = []
        for coro in asyncio.as_completed(tasks):
            try:
                results.append(await coro)
            except TrexPullError as exc:
                results.append(exc)

        id_order = {tid: i for i, tid in enumerate(trex_ids)}
        results.sort(key=lambda r: id_order.get(
            r.trex_id if isinstance(r, TZPPayload) else r.trex_id, 0
        ))
        return results

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    async def __aenter__(self) -> TrexClient:
        return self

    async def __aexit__(self, *exc: Any) -> None:
        await self.close()
