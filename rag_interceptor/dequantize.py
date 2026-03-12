"""TZP dequantization and fallback text decompression.

Implements TZP v1.0 Specification Appendix A.3:
    v_hat[k,i] = ((q[k,i] + 128) / 255) * (max - min) + min
"""

from __future__ import annotations

import base64
from typing import TYPE_CHECKING

import numpy as np
import zstandard as zstd

if TYPE_CHECKING:
    from .models import QuantParams, TZPPayload


def dequantize_vector(b64_data: str, qp: QuantParams) -> np.ndarray:
    """Dequantize a single Base64-encoded Int8 vector back to Float32."""
    raw = base64.b64decode(b64_data)
    q = np.frombuffer(raw, dtype=np.int8).astype(np.float32)
    return ((q + 128.0) / 255.0) * (qp.max - qp.min) + qp.min


def dequantize_payload(payload: TZPPayload) -> list[np.ndarray]:
    """Dequantize all vectors in a TZP payload.

    Handles both global and per-chunk quant_params modes.
    """
    vectors: list[np.ndarray] = []
    is_per_chunk = payload.is_per_chunk_quant

    for idx, b64_vec in enumerate(payload.vector_seq_b64):
        qp = payload.quant_params[idx] if is_per_chunk else payload.quant_params[0]
        vectors.append(dequantize_vector(b64_vec, qp))

    return vectors


def decompress_fallback_text(zstd_b64: str) -> str:
    """Decompress fallback_text_zstd_b64 to UTF-8 plaintext."""
    compressed = base64.b64decode(zstd_b64)
    decompressor = zstd.ZstdDecompressor()
    return decompressor.decompress(compressed).decode("utf-8")
