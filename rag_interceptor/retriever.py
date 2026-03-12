"""LangChain custom retriever with dual-path TZP vector retrieval.

Path A (fallback_strong): fallback_text + strong embedding re-encode → FAISS
Path B (vector_only):     dequantized MiniLM vectors → cosine similarity
"""

from __future__ import annotations

import logging
from typing import Any

import numpy as np
from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever

from .cache import InterceptorCache
from .chunking import get_chunks
from .dequantize import decompress_fallback_text, dequantize_payload
from .embeddings import get_embedding_model, get_minilm_model
from .models import (
    ChunkConfig,
    RAGConfig,
    RetrievalTier,
    TZPPayload,
)

logger = logging.getLogger(__name__)


class TZPRetriever(BaseRetriever):
    """Retriever that builds an on-demand vector index from a TZP payload.

    Automatically selects the optimal retrieval path and caches the
    FAISS index for subsequent queries against the same payload.
    """

    payload: Any       # TZPPayload
    rag_config: Any    # RAGConfig
    chunk_config: Any  # ChunkConfig
    cache: Any = None  # InterceptorCache | None
    tier: str = ""     # RetrievalTier value, set during _prepare

    _chunks: list[str] | None = None
    _faiss_index: Any = None
    _embedding_model: Any = None
    _embedding_model_name: str = ""

    class Config:
        arbitrary_types_allowed = True

    def model_post_init(self, __context: Any) -> None:
        self._prepare()

    def _cache_key(self) -> str:
        cfg: RAGConfig = self.rag_config
        cc: ChunkConfig = self.chunk_config
        em = cfg.embedding_model if self.tier == RetrievalTier.FALLBACK_STRONG else "minilm"
        return InterceptorCache.build_cache_key(
            self.payload.trex_id, em, cc.chunk_size, cc.chunk_overlap,
        )

    def _prepare(self) -> None:
        payload: TZPPayload = self.payload
        rag: RAGConfig = self.rag_config

        if payload.has_fallback_text:
            self.tier = RetrievalTier.FALLBACK_STRONG
        else:
            self.tier = RetrievalTier.VECTOR_ONLY

        # Try cache first
        if self.cache is not None:
            cached = self.cache.get_index(self._cache_key())
            if cached is not None:
                self._faiss_index, self._chunks = cached
                self._embedding_model = (
                    get_embedding_model(rag)
                    if self.tier == RetrievalTier.FALLBACK_STRONG
                    else get_minilm_model(rag)
                )
                self._embedding_model_name = (
                    rag.embedding_model
                    if self.tier == RetrievalTier.FALLBACK_STRONG
                    else "minilm"
                )
                logger.info("TZPRetriever: cache hit for %s", payload.trex_id)
                return

        if self.tier == RetrievalTier.FALLBACK_STRONG:
            self._prepare_path_a(payload, rag)
        else:
            self._prepare_path_b(payload, rag)

        # Write back to cache
        if self.cache is not None and self._faiss_index is not None:
            self.cache.set_index(self._cache_key(), self._faiss_index, self._chunks or [])

    def _prepare_path_a(self, payload: TZPPayload, rag: RAGConfig) -> None:
        logger.info("TZPRetriever: Path A (fallback_strong) — re-embedding with %s", rag.embedding_model)
        self._embedding_model_name = rag.embedding_model

        # Decompress (with text cache)
        text: str | None = None
        if self.cache is not None:
            text = self.cache.get_text(payload.trex_id)
        if text is None:
            text = decompress_fallback_text(payload.fallback_text_zstd_b64)  # type: ignore[arg-type]
            if self.cache is not None:
                self.cache.set_text(payload.trex_id, text)

        cc: ChunkConfig = self.chunk_config
        self._chunks = get_chunks(payload, text, cc)

        if not self._chunks:
            self._chunks = [text] if text.strip() else []

        self._embedding_model = get_embedding_model(rag)
        doc_embeddings = self._embedding_model.embed_documents(self._chunks)
        self._build_faiss_index(np.array(doc_embeddings, dtype=np.float32))

    def _prepare_path_b(self, payload: TZPPayload, rag: RAGConfig) -> None:
        logger.info("TZPRetriever: Path B (vector_only) — dequantized MiniLM vectors")
        self._embedding_model_name = "minilm"

        vectors = dequantize_payload(payload)
        self._chunks = [
            f"[Chunk {i}] (vector-only, no text available)"
            for i in range(len(vectors))
        ]
        self._embedding_model = get_minilm_model(rag)
        self._build_faiss_index(np.stack(vectors).astype(np.float32))

    def _build_faiss_index(self, matrix: np.ndarray) -> None:
        import faiss

        faiss.normalize_L2(matrix)
        index = faiss.IndexFlatIP(matrix.shape[1])
        index.add(matrix)
        self._faiss_index = index

    def _get_relevant_documents(
        self,
        query: str,
        *,
        run_manager: CallbackManagerForRetrieverRun | None = None,
    ) -> list[Document]:
        rag: RAGConfig = self.rag_config
        top_k = min(rag.top_k, len(self._chunks or []))
        if top_k == 0:
            return []

        query_vec = np.array(
            self._embedding_model.embed_query(query), dtype=np.float32
        ).reshape(1, -1)

        import faiss
        faiss.normalize_L2(query_vec)
        scores, indices = self._faiss_index.search(query_vec, top_k)

        source_type = "fallback_text" if self.tier == RetrievalTier.FALLBACK_STRONG else "dequantized_vector"

        documents: list[Document] = []
        for rank, (idx, score) in enumerate(zip(indices[0], scores[0])):
            if idx < 0:
                continue
            documents.append(
                Document(
                    page_content=self._chunks[idx],  # type: ignore[index]
                    metadata={
                        "trex_id": self.payload.trex_id,
                        "chunk_index": int(idx),
                        "score": float(score),
                        "rank": rank,
                        "retrieval_tier": self.tier,
                        "embedding_model": self._embedding_model_name,
                        "source_type": source_type,
                    },
                )
            )
        return documents
