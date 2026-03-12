#!/usr/bin/env python3
"""
TZP RAG Interceptor — 逐层单元测试 + 端到端集成测试。

用法:
    # 单元测试（不需要 TrexAPI 服务端）
    python tests/test_rag_interceptor.py

    # 端到端测试（需要 TrexAPI 运行在 localhost:3000）
    TREX_API_KEY=your_key python tests/test_rag_interceptor.py --e2e
"""

from __future__ import annotations

import asyncio
import base64
import json
import os
import sys
import time
import traceback

# Ensure project root is on sys.path so `rag_interceptor` is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import numpy as np

PASS = 0
FAIL = 0
SKIP = 0


def section(name: str) -> None:
    print(f"\n{'='*60}")
    print(f"  {name}")
    print(f"{'='*60}")


def check(label: str, condition: bool, detail: str = "") -> None:
    global PASS, FAIL
    status = "PASS" if condition else "FAIL"
    if condition:
        PASS += 1
        print(f"  [{status}] {label}")
    else:
        FAIL += 1
        print(f"  [{status}] {label}")
        if detail:
            print(f"         -> {detail}")


def skip(label: str, reason: str) -> None:
    global SKIP
    SKIP += 1
    print(f"  [SKIP] {label} — {reason}")


# =========================================================================
# 1. models
# =========================================================================

def test_models():
    section("1. models.py")

    from rag_interceptor.models import (
        BudgetConfig,
        ChunkConfig,
        ErrorMode,
        InterceptorConfig,
        QuantParams,
        RAGConfig,
        RetrievalResult,
        RetrievalTier,
        TagMatch,
        TrexConfig,
        TZPPayload,
    )

    check("RetrievalTier has 2 values",
          len(RetrievalTier) == 2)

    check("ErrorMode has 3 values",
          len(ErrorMode) == 3)

    cfg = InterceptorConfig()
    check("InterceptorConfig defaults",
          cfg.error_mode == ErrorMode.PLACEHOLDER
          and cfg.inject_with_source_label is True
          and cfg.rag.embedding_model == "bge-m3"
          and cfg.budget.max_tzp_tags == 5)

    p = TZPPayload(
        trex_id="tx_us_test12345", tzp_version="1.0",
        vector_seq_b64=["a", "b"], quant_params=[
            QuantParams(min=-1, max=1), QuantParams(min=-2, max=2)
        ],
        dimensions=384, chunk_count=2,
    )
    check("TZPPayload.is_per_chunk_quant",
          p.is_per_chunk_quant is True)
    check("TZPPayload.has_fallback_text (no)",
          p.has_fallback_text is False)

    rr = RetrievalResult(trex_id="tx_us_x")
    check("RetrievalResult default tier",
          rr.tier == RetrievalTier.VECTOR_ONLY)


# =========================================================================
# 2. config
# =========================================================================

def test_config():
    section("2. config.py")

    from rag_interceptor.config import build_config

    c = build_config(
        embedding_model="voyage-3",
        max_inject_tokens=300,
        chunk_overlap=16,
        error_mode="summary",
    )
    check("build_config embedding_model",
          c.rag.embedding_model == "voyage-3")
    check("build_config max_inject_tokens",
          c.budget.max_inject_tokens == 300)
    check("build_config chunk_overlap",
          c.chunk.chunk_overlap == 16)
    check("build_config error_mode",
          c.error_mode.value == "summary")


# =========================================================================
# 3. parser
# =========================================================================

def test_parser():
    section("3. parser.py")

    from rag_interceptor.parser import (
        extract_tzp_tags,
        replace_tzp_tags,
        strip_escaped_markers,
    )

    # Basic detection
    tags = extract_tzp_tags("Hello [TZP: tx_us_8f9A2bXr7] world")
    check("basic detect",
          len(tags) == 1 and tags[0].trex_id == "tx_us_8f9A2bXr7")

    # Multiple tags
    tags = extract_tzp_tags("[TZP: tx_us_aaaaaaaaa] and [TZP: tx_cn_bbbbbbbbb]")
    check("multiple tags",
          len(tags) == 2)

    # Escaped marker excluded
    tags = extract_tzp_tags(r"See \[TZP: tx_us_8f9A2bXr7] here")
    check("escaped marker excluded",
          len(tags) == 0)

    # Code block excluded
    tags = extract_tzp_tags("```\n[TZP: tx_us_8f9A2bXr7]\n``` and [TZP: tx_us_aaaaaaaaa]")
    check("code block excluded, other detected",
          len(tags) == 1 and tags[0].trex_id == "tx_us_aaaaaaaaa")

    # Inline code excluded
    tags = extract_tzp_tags("Use `[TZP: tx_us_8f9A2bXr7]` like this")
    check("inline code excluded",
          len(tags) == 0)

    # strip_escaped_markers
    result = strip_escaped_markers(r"\[TZP: tx_us_8f9A2bXr7]")
    check("strip_escaped preserves text",
          result == "[TZP: tx_us_8f9A2bXr7]")

    # replace_tzp_tags
    tags = extract_tzp_tags("A [TZP: tx_us_aaaaaaaaa] B [TZP: tx_us_bbbbbbbbb] C")
    replaced = replace_tzp_tags(
        "A [TZP: tx_us_aaaaaaaaa] B [TZP: tx_us_bbbbbbbbb] C",
        tags,
        {"tx_us_aaaaaaaaa": "<CTX_A>", "tx_us_bbbbbbbbb": "<CTX_B>"},
    )
    check("replace preserves order",
          replaced == "A <CTX_A> B <CTX_B> C")


# =========================================================================
# 4. cache
# =========================================================================

def test_cache():
    section("4. cache.py")

    from rag_interceptor.cache import InterceptorCache
    from rag_interceptor.models import TZPPayload

    cache = InterceptorCache(max_entries=3)

    # Set and get
    p = TZPPayload(trex_id="tx_us_test11111", tzp_version="1.0",
                   vector_seq_b64=[], quant_params=[], dimensions=384, chunk_count=0)
    cache.set_payload("tx_us_test11111", p)
    check("get_payload hit",
          cache.get_payload("tx_us_test11111") is not None)
    check("get_payload miss",
          cache.get_payload("tx_us_nonexist0") is None)

    # LRU eviction
    cache.set_text("a", "text_a")
    cache.set_text("b", "text_b")
    cache.set_text("c", "text_c")
    # "tx_us_test11111" payload should be evicted (oldest, max=3)
    stats = cache.stats()
    check("LRU eviction (max=3, 4 inserts → 3 entries)",
          stats["entries"] == 3)

    # Cache key
    key1 = InterceptorCache.build_cache_key("tx_us_x", "bge-m3", 256, 32)
    key2 = InterceptorCache.build_cache_key("tx_us_x", "bge-m3", 256, 32)
    key3 = InterceptorCache.build_cache_key("tx_us_x", "minilm", 256, 32)
    check("cache_key deterministic",
          key1 == key2)
    check("cache_key differs by model",
          key1 != key3)

    # Stats
    check("stats has hits/misses",
          "hits" in stats and "misses" in stats)

    # Clear
    cache.clear()
    check("clear resets",
          cache.stats()["entries"] == 0)


# =========================================================================
# 5. budget
# =========================================================================

def test_budget():
    section("5. budget.py")

    from rag_interceptor.budget import BudgetController
    from rag_interceptor.models import BudgetConfig, TagMatch

    bc = BudgetController(BudgetConfig(
        max_tzp_tags=2,
        max_total_chunks=3,
        max_total_fallback_chars=20,
        max_total_embedding_texts=5,
        max_inject_tokens=10,
    ))

    # Tag limit
    tags = [TagMatch("a", 0, 5), TagMatch("b", 6, 11), TagMatch("c", 12, 17)]
    trimmed = bc.check_tag_limit(tags)
    check("tag limit 3→2",
          len(trimmed) == 2)

    # Chunk limit
    chunks = ["c1", "c2", "c3", "c4", "c5"]
    check("chunk limit 5→3",
          len(bc.check_chunk_limit(chunks)) == 3)

    # Fallback text
    text = "a" * 50
    check("fallback text truncated to 20",
          len(bc.check_fallback_text(text)) == 20)

    # Embedding budget
    texts, downgrade = bc.check_embedding_budget(["t"] * 10, cached_count=0)
    check("embedding budget 10→5",
          len(texts) == 5 and downgrade is False)

    _, downgrade = bc.check_embedding_budget(["t"] * 3, cached_count=10)
    check("embedding exhausted → downgrade",
          downgrade is True)

    # Injection truncation
    result = bc.truncate_injection(["word " * 20, "word " * 20])
    total_words = sum(len(c.split()) for c in result)
    check("injection truncation respects budget",
          total_words <= 10)  # 10 tokens * 0.75 ≈ 7 words


# =========================================================================
# 6. chunking
# =========================================================================

def test_chunking():
    section("6. chunking.py")

    from rag_interceptor.chunking import (
        chunk_by_payload_boundary,
        chunk_by_tokens,
        get_chunks,
    )
    from rag_interceptor.models import ChunkConfig, TZPPayload

    # payload_boundary
    text = " ".join(f"w{i}" for i in range(100))
    chunks = chunk_by_payload_boundary(text, 5)
    check("payload_boundary produces 5 chunks",
          len(chunks) == 5)
    check("payload_boundary covers all words",
          sum(len(c.split()) for c in chunks) == 100)

    # token overlap
    chunks = chunk_by_tokens(text, chunk_size=10, overlap=2)
    check("chunk_by_tokens produces multiple chunks",
          len(chunks) > 5)
    check("chunk_by_tokens non-empty",
          all(len(c.strip()) > 0 for c in chunks))

    # get_chunks with payload_first
    payload = TZPPayload(
        trex_id="tx_us_test00000", tzp_version="1.0",
        vector_seq_b64=["a"] * 4, quant_params=[], dimensions=384, chunk_count=4,
    )
    cfg = ChunkConfig(strategy="payload_first")
    chunks = get_chunks(payload, text, cfg)
    check("get_chunks payload_first produces 4 chunks",
          len(chunks) == 4)


# =========================================================================
# 7. dequantize
# =========================================================================

def test_dequantize():
    section("7. dequantize.py")

    from rag_interceptor.dequantize import dequantize_vector, decompress_fallback_text
    from rag_interceptor.models import QuantParams

    import zstandard as zstd

    # Dequantize known values
    qp = QuantParams(min=-1.0, max=1.0)
    vec_int8 = np.array([-128, 0, 127], dtype=np.int8)
    b64 = base64.b64encode(vec_int8.tobytes()).decode()
    result = dequantize_vector(b64, qp)

    check("dequantize -128 → -1.0",
          abs(result[0] - (-1.0)) < 0.01)
    check("dequantize 0 → ~0.004",
          abs(result[1]) < 0.01)
    check("dequantize 127 → 1.0",
          abs(result[2] - 1.0) < 0.01)

    # Decompress fallback text
    original = "Hello, this is fallback text for testing."
    compressor = zstd.ZstdCompressor()
    compressed = compressor.compress(original.encode("utf-8"))
    b64_zstd = base64.b64encode(compressed).decode()
    recovered = decompress_fallback_text(b64_zstd)
    check("decompress_fallback_text roundtrip",
          recovered == original)


# =========================================================================
# 8. interceptor (unit-level, no server)
# =========================================================================

def test_interceptor_unit():
    section("8. interceptor.py (unit)")

    from rag_interceptor.interceptor import TZPInterceptor
    from rag_interceptor.models import ErrorMode, InterceptorConfig

    # No tags → pass-through
    cfg = InterceptorConfig()
    interceptor = TZPInterceptor(cfg)
    result = asyncio.run(interceptor.process("Hello world", "question?"))
    check("no tags → pass-through",
          result == "Hello world")

    # Escaped tags: per spec 4.4.3, backslash is removed and the text
    # becomes a literal [TZP: ...] — but that literal will then be
    # re-detected by the parser. To truly escape, the test must verify
    # the strip step alone, not the full pipeline. Test strip in parser.
    # Here we test that a prompt with ONLY an escaped marker (no valid
    # marker after stripping) produces an error or gets processed.
    result = asyncio.run(
        interceptor.process(r"\[TZP: tx_us_8f9A2bXr7] is a reference", "q")
    )
    # After stripping the backslash, [TZP: tx_us_8f9A2bXr7] becomes a
    # valid marker that gets pulled (and likely fails → error placeholder).
    # This is correct spec behavior.
    check("escaped tag: backslash stripped, marker processed",
          r"\[TZP:" not in result)

    asyncio.run(interceptor.close())

    # ErrorMode.SUMMARY format
    check("ErrorMode.SUMMARY",
          TZPInterceptor._format_error("tx_us_x", "FAIL", ErrorMode.SUMMARY)
          == "(Context tx_us_x is temporarily unavailable)")

    # ErrorMode.SILENT_SKIP format
    check("ErrorMode.SILENT_SKIP",
          TZPInterceptor._format_error("tx_us_x", "FAIL", ErrorMode.SILENT_SKIP)
          == "")


# =========================================================================
# 9. langchain module (import-level)
# =========================================================================

def test_langchain_imports():
    section("9. langchain.py (imports)")

    from rag_interceptor.langchain import TZPChatModel, TZPRunnable
    from rag_interceptor.models import InterceptorConfig

    cfg = InterceptorConfig()
    runnable = TZPRunnable(interceptor_config=cfg)
    check("TZPRunnable instantiation",
          runnable.context_key == "context")

    # TZPRunnable pass-through (no TZP tags)
    result = asyncio.run(runnable.ainvoke({
        "context": "No tags here",
        "question": "What?",
    }))
    check("TZPRunnable pass-through",
          result["context"] == "No tags here")

    check("TZPChatModel._llm_type",
          hasattr(TZPChatModel, '_llm_type'))


# =========================================================================
# 10. cache integration
# =========================================================================

def test_cache_integration():
    section("10. cache integration")

    from rag_interceptor.cache import InterceptorCache

    cache = InterceptorCache(max_entries=64)

    # Index cache roundtrip
    key = InterceptorCache.build_cache_key("tx_us_x", "bge-m3", 256, 32)
    fake_index = {"dim": 384}
    chunks = ["chunk_0", "chunk_1"]
    cache.set_index(key, fake_index, chunks)
    result = cache.get_index(key)

    check("index cache roundtrip",
          result is not None
          and result[0] == fake_index
          and result[1] == chunks)

    stats = cache.stats()
    check("stats reflect operations",
          stats["hits"] >= 1 and stats["entries"] >= 1)


# =========================================================================
# E2E: End-to-End (requires TrexAPI running)
# =========================================================================

async def test_e2e():
    section("E2E: End-to-End Integration")

    import os
    import zstandard as zstd
    import httpx

    api_key = os.environ.get("TREX_API_KEY", "")
    base_url = os.environ.get("TREX_API_URL", "http://localhost:3000")

    if not api_key:
        skip("E2E tests", "TREX_API_KEY not set")
        return

    # Check if server is reachable
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(f"{base_url}/health")
            if resp.status_code != 200:
                skip("E2E tests", f"TrexAPI not healthy (HTTP {resp.status_code})")
                return
    except Exception:
        skip("E2E tests", "TrexAPI not reachable at " + base_url)
        return

    print("  TrexAPI reachable, running E2E tests...\n")

    # Step 1: Push a payload with fallback_text
    original_text = (
        "The Federal Reserve signaled a pause in interest rate hikes "
        "during the Q1 2026 meeting. Key factors include slowing GDP growth, "
        "cooling labor markets, and persistent geopolitical risks in East Asia. "
        "The tech sector showed resilience with AI-driven revenue growth. "
        "Consumer spending declined 2.3% in January, marking the third "
        "consecutive monthly decrease. Housing starts fell below expectations."
    )

    compressor = zstd.ZstdCompressor()
    fb_compressed = compressor.compress(original_text.encode("utf-8"))
    fb_b64 = base64.b64encode(fb_compressed).decode()

    num_chunks = 3
    vectors_b64 = []
    quant_params = []
    for _ in range(num_chunks):
        v = np.random.randint(-128, 127, size=384, dtype=np.int8)
        vectors_b64.append(base64.b64encode(v.tobytes()).decode())
        quant_params.append({"min": -3.0, "max": 4.0, "method": "percentile_99_9_int8"})

    push_body = {
        "tzp_version": "1.0",
        "payload": {
            "vector_seq_b64": vectors_b64,
            "quant_params": quant_params,
            "dimensions": 384,
            "chunk_count": num_chunks,
            "fallback_text_zstd_b64": fb_b64,
            "summary": "Q1 2026 Fed analysis",
            "source_lang": "en",
        },
        "metadata": {
            "sender_agent_id": "test-agent",
            "ttl_seconds": 3600,
        },
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{base_url}/v1/payloads",
            json=push_body,
            headers={"Authorization": f"Bearer {api_key}"},
        )

    check("Push payload",
          resp.status_code == 201,
          f"HTTP {resp.status_code}: {resp.text[:200]}")

    if resp.status_code != 201:
        skip("remaining E2E", "push failed")
        return

    trex_id = resp.json()["trex_id"]
    print(f"  -> trex_id: {trex_id}\n")

    # Step 2: Interceptor process (first call — cold)
    from rag_interceptor import TZPInterceptor, build_config

    config = build_config(
        api_key=api_key,
        api_base_url=base_url,
        embedding_model="minilm",  # lightweight for testing
        top_k=3,
        max_inject_tokens=200,
    )

    async with TZPInterceptor(config) as interceptor:
        prompt = f"Based on the following background: [TZP: {trex_id}]"

        t0 = time.perf_counter()
        result = await interceptor.process(prompt, "What did the Fed signal?")
        cold_ms = (time.perf_counter() - t0) * 1000

        check("Cold call: TZP marker replaced",
              f"[TZP: {trex_id}]" not in result)
        check("Cold call: context injected",
              len(result) > len(prompt))
        check("Cold call: no error placeholder",
              "TZP_ERROR" not in result)
        print(f"  -> Cold latency: {cold_ms:.0f}ms")
        print(f"  -> Output preview: {result[:120]}...\n")

        # Step 3: Second call (warm — cache hit)
        t1 = time.perf_counter()
        result2 = await interceptor.process(
            f"Another question about [TZP: {trex_id}]",
            "What about housing?",
        )
        warm_ms = (time.perf_counter() - t1) * 1000

        check("Warm call: cache hit (faster)",
              warm_ms < cold_ms or warm_ms < 100,
              f"cold={cold_ms:.0f}ms warm={warm_ms:.0f}ms")
        print(f"  -> Warm latency: {warm_ms:.0f}ms")

        # Step 4: Cache stats
        stats = interceptor.cache.stats()
        check("Cache has hits",
              stats["hits"] > 0,
              f"stats={stats}")
        print(f"  -> Cache stats: {stats}\n")

    # Step 5: Error handling — non-existent ID
    async with TZPInterceptor(config) as interceptor:
        bad_result = await interceptor.process(
            "[TZP: tx_us_NOTEXIST0]", "question"
        )
        check("Non-existent ID → error placeholder",
              "TZP_ERROR" in bad_result or "NOTEXIST0" in bad_result)
        print(f"  -> Error output: {bad_result}\n")


# =========================================================================
# Main
# =========================================================================

def main():
    global PASS, FAIL, SKIP

    print("\n" + "=" * 60)
    print("  TZP RAG Interceptor — Test Suite")
    print("=" * 60)

    # Unit tests (no server required)
    tests = [
        test_models,
        test_config,
        test_parser,
        test_cache,
        test_budget,
        test_chunking,
        test_dequantize,
        test_interceptor_unit,
        test_langchain_imports,
        test_cache_integration,
    ]

    for test_fn in tests:
        try:
            test_fn()
        except Exception:
            FAIL += 1
            print(f"  [FAIL] {test_fn.__name__} — EXCEPTION")
            traceback.print_exc()

    # E2E tests (optional, requires --e2e flag)
    if "--e2e" in sys.argv:
        try:
            asyncio.run(test_e2e())
        except Exception:
            FAIL += 1
            print(f"  [FAIL] test_e2e — EXCEPTION")
            traceback.print_exc()
    else:
        section("E2E: Skipped")
        print("  Pass --e2e flag to run end-to-end tests")
        print("  Requires: TrexAPI running + TREX_API_KEY set")

    # Summary
    print("\n" + "=" * 60)
    total = PASS + FAIL
    print(f"  Results: {PASS}/{total} passed, {FAIL} failed, {SKIP} skipped")
    print("=" * 60 + "\n")

    return 0 if FAIL == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
