"""TZP RAG Interceptor — compatibility layer for TrexAPI + LangChain.

Push-time: lightweight MiniLM 384d quantized vectors via TZP protocol.
Pull-time: strong-model (bge-m3 / voyage-3) query-time alignment via RAG.
"""

from .cache import InterceptorCache
from .config import build_config
from .interceptor import TZPInterceptor
from .langchain import TZPChatModel, TZPRunnable
from .models import (
    BudgetConfig,
    ChunkConfig,
    ErrorMode,
    InterceptorConfig,
    RAGConfig,
    RetrievalResult,
    RetrievalTier,
    TrexConfig,
    TZPPayload,
)
from .retriever import TZPRetriever
from .trex_client import TrexClient

__all__ = [
    "build_config",
    "BudgetConfig",
    "ChunkConfig",
    "ErrorMode",
    "InterceptorCache",
    "InterceptorConfig",
    "RAGConfig",
    "RetrievalResult",
    "RetrievalTier",
    "TrexClient",
    "TrexConfig",
    "TZPChatModel",
    "TZPInterceptor",
    "TZPPayload",
    "TZPRetriever",
    "TZPRunnable",
]
