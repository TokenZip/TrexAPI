"""Configuration assembly for the TZP RAG Interceptor.

All type definitions live in models.py; this module provides a
convenience factory for building InterceptorConfig from environment
variables or explicit arguments.
"""

from __future__ import annotations

from .models import (
    BudgetConfig,
    ChunkConfig,
    ErrorMode,
    InterceptorConfig,
    RAGConfig,
    TrexConfig,
)

__all__ = [
    "build_config",
    "BudgetConfig",
    "ChunkConfig",
    "ErrorMode",
    "InterceptorConfig",
    "RAGConfig",
    "TrexConfig",
]


def build_config(
    *,
    api_base_url: str = "http://localhost:3000",
    api_key: str = "",
    timeout: float = 10.0,
    embedding_model: str = "bge-m3",
    top_k: int = 5,
    voyage_api_key: str = "",
    chunk_size: int = 256,
    chunk_overlap: int = 32,
    chunk_strategy: str = "payload_first",
    max_tzp_tags: int = 5,
    max_inject_tokens: int = 500,
    error_mode: str | ErrorMode = ErrorMode.PLACEHOLDER,
    inject_with_source_label: bool = True,
) -> InterceptorConfig:
    """One-call factory that assembles a full InterceptorConfig.

    Reads TREX_API_KEY / VOYAGE_API_KEY from env when not provided.
    """
    if isinstance(error_mode, str):
        error_mode = ErrorMode(error_mode)

    return InterceptorConfig(
        trex=TrexConfig(
            api_base_url=api_base_url,
            api_key=api_key,
            timeout=timeout,
        ),
        rag=RAGConfig(
            embedding_model=embedding_model,  # type: ignore[arg-type]
            top_k=top_k,
            voyage_api_key=voyage_api_key,
        ),
        chunk=ChunkConfig(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            strategy=chunk_strategy,  # type: ignore[arg-type]
        ),
        budget=BudgetConfig(
            max_tzp_tags=max_tzp_tags,
            max_inject_tokens=max_inject_tokens,
        ),
        error_mode=error_mode,
        inject_with_source_label=inject_with_source_label,
    )
