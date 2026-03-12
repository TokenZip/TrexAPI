# TZP RAG Interceptor — LangChain Integration Guide

# TZP RAG Interceptor — LangChain 接入指南

---

## How It Works / 工作原理

```
Agent A                          TrexAPI                     Your LangChain App
  │                                │                              │
  │── push(text) ─────────────────▶│                              │
  │   MiniLM 384d quantize         │                              │
  │◀── trex_id ───────────────────│                              │
  │                                │                              │
  │── "[TZP: tx_us_8f9A2bXr7]" ──────────────────────────────────▶│
  │                                │       TZPRunnable / TZPChatModel
  │                                │◀── GET /v1/payloads/:id ─────│
  │                                │── payload ──────────────────▶│
  │                                │              dequantize + bge-m3 re-embed
  │                                │              FAISS top-k retrieval
  │                                │              inject context into prompt
  │                                │                        ┌─────▼─────┐
  │                                │                        │  ChatGPT  │
  │                                │                        └───────────┘
```

The interceptor sits **between your prompt and the LLM**. When it sees `[TZP: ...]` markers, it automatically pulls the quantized vectors from TrexAPI, re-embeds the fallback text with a strong model (bge-m3 / voyage-3), retrieves the most relevant chunks, and injects them into the prompt — all before the LLM sees it.

Interceptor 位于 **prompt 和 LLM 之间**。当它检测到 `[TZP: ...]` 标记时，会自动从 TrexAPI 拉取量化向量，用强模型（bge-m3 / voyage-3）重新编码 fallback 原文，检索最相关的 chunks，注入 prompt — 这一切在 LLM 看到 prompt 之前完成。

---

## Prerequisites / 前置条件

```bash
# 1. Install dependencies / 安装依赖
pip install -r rag_interceptor/requirements.txt
pip install langchain-openai   # or your preferred LLM provider / 或你使用的 LLM 提供商

# 2. Set environment variables / 设置环境变量
export TREX_API_KEY="your_key"
export OPENAI_API_KEY="sk-..."        # for ChatOpenAI
export VOYAGE_API_KEY="voy-..."       # only if using voyage-3 / 仅 voyage-3 模式需要

# 3. Start TrexAPI / 启动 TrexAPI
cd TrexAPI && npm run build && npm run start
```

---

## Integration Mode A: LCEL Runnable / 接入模式 A：LCEL Runnable

Best for: **new chains where you control the prompt template.**

适用场景：**新建 chain，你能控制 prompt 模板结构。**

### Basic Usage / 基本用法

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from rag_interceptor import TZPRunnable, build_config

# Configure / 配置
config = build_config(
    api_key="your_dev_api_key",           # or set TREX_API_KEY env var
    api_base_url="http://localhost:3000",  # TrexAPI address
    embedding_model="bge-m3",             # strong model for query-time alignment
    top_k=5,                              # retrieve top 5 chunks
    max_inject_tokens=500,                # limit injected context length
)

# Build chain / 构建 chain
chain = (
    TZPRunnable(interceptor_config=config)
    | ChatPromptTemplate.from_template(
        "Based on the following context, answer the question.\n\n"
        "Context: {context}\n\n"
        "Question: {question}"
    )
    | ChatOpenAI(model="gpt-4o")
)

# Invoke / 调用
result = chain.invoke({
    "context": "Reference material: [TZP: tx_us_8f9A2bXr7]",
    "question": "What did the Fed signal in Q1?",
})
print(result.content)
```

### Async Usage / 异步调用

```python
import asyncio

async def main():
    result = await chain.ainvoke({
        "context": "[TZP: tx_us_8f9A2bXr7]",
        "question": "Summarize the key risks.",
    })
    print(result.content)

asyncio.run(main())
```

### Custom Field Names / 自定义字段名

By default, `TZPRunnable` reads `context` for TZP markers and `question` for the RAG query. You can customize this:

默认情况下，`TZPRunnable` 从 `context` 字段检测 TZP 标记，从 `question` 字段提取 RAG 查询。可以自定义：

```python
chain = (
    TZPRunnable(
        interceptor_config=config,
        context_key="background",   # your dict key / 你的字典 key
        question_key="query",
    )
    | ChatPromptTemplate.from_template(
        "Background: {background}\n\nQuery: {query}"
    )
    | ChatOpenAI(model="gpt-4o")
)

result = chain.invoke({
    "background": "[TZP: tx_us_8f9A2bXr7]",
    "query": "What happened?",
})
```

### What Happens Inside / 内部流程

```
Input:  {"context": "See [TZP: tx_us_8f9A2bXr7]", "question": "Q1 trends?"}
                                    │
                              TZPRunnable
                                    │
                    ┌───────────────┼───────────────┐
                    │  1. Detect [TZP: ...] marker  │
                    │  2. Pull payload from TrexAPI  │
                    │  3. Decompress fallback text   │
                    │  4. Re-embed with bge-m3       │
                    │  5. FAISS search top-5         │
                    │  6. Inject into context        │
                    └───────────────┼───────────────┘
                                    │
Output: {"context": "[Context from tx_us_8f9A2bXr7]\n- chunk1\n- chunk2...",
         "question": "Q1 trends?"}
```

---

## Integration Mode C: ChatModel Wrapper / 接入模式 C：ChatModel 透明包装

Best for: **existing code that already uses a ChatModel — zero code changes needed.**

适用场景：**已有代码直接调用 ChatModel，不想改结构 — 零代码改动。**

### Basic Usage / 基本用法

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from rag_interceptor import TZPChatModel, build_config

config = build_config(
    api_key="your_dev_api_key",
    embedding_model="bge-m3",
)

# Wrap any ChatModel / 包装任意 ChatModel
model = TZPChatModel(
    inner=ChatOpenAI(model="gpt-4o"),
    interceptor_config=config,
)

# Use exactly like a normal ChatModel / 用法与普通 ChatModel 完全一致
result = model.invoke([
    SystemMessage("You are a financial analyst."),
    HumanMessage("Based on [TZP: tx_us_8f9A2bXr7], what are the key risk factors?"),
])
print(result.content)
```

### Multi-turn Conversations / 多轮对话

Every message is scanned for TZP markers:

每条消息都会被扫描：

```python
result = model.invoke([
    SystemMessage("You are a research assistant."),
    HumanMessage("Review this background: [TZP: tx_us_aaaaaaaaa]"),
    HumanMessage("Now compare with this: [TZP: tx_cn_bbbbbbbbb]\nSummarize the differences."),
])
```

### With LangChain Agents / 配合 LangChain Agent

```python
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant with access to tools."),
    MessagesPlaceholder("chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder("agent_scratchpad"),
])

# The agent's LLM automatically expands TZP markers
# Agent 的 LLM 会自动展开 TZP 标记
agent = create_tool_calling_agent(model, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools)

result = executor.invoke({
    "input": "Analyze [TZP: tx_us_8f9A2bXr7] and recommend next steps.",
})
```

---

## Configuration Reference / 配置参数参考

```python
config = build_config(
    # --- TrexAPI Connection / TrexAPI 连接 ---
    api_base_url="http://localhost:3000",  # TrexAPI server URL
    api_key="",                            # or env TREX_API_KEY
    timeout=10.0,                          # HTTP timeout in seconds / 超时秒数

    # --- Embedding Model / 嵌入模型 ---
    embedding_model="bge-m3",   # "bge-m3" (local, 1024d, recommended)
                                # "voyage-3" (API, 1024d)
                                # "minilm" (local, 384d, same-space fallback)
    voyage_api_key="",          # required for voyage-3 / voyage-3 需要

    # --- Retrieval / 检索 ---
    top_k=5,                    # number of chunks to retrieve / 检索 chunk 数

    # --- Chunking / 分块 ---
    chunk_size=256,             # tokens per chunk / 每块 token 数
    chunk_overlap=32,           # overlap between chunks / 块间重叠
    chunk_strategy="payload_first",  # "payload_first": align with push-time chunks
                                     # "recut": re-chunk locally

    # --- Budget / 预算控制 ---
    max_tzp_tags=5,             # max TZP markers per prompt / 单次最多标记数
    max_inject_tokens=500,      # max tokens injected / 最多注入 token 数

    # --- Error Handling / 错误处理 ---
    error_mode="placeholder",   # "placeholder": [TZP_ERROR: id: code]
                                # "silent_skip": remove marker silently / 静默跳过
                                # "summary": human-readable note / 简短说明

    # --- Output Format / 输出格式 ---
    inject_with_source_label=True,  # prepend [Context from tx_...] / 带来源标记
)
```

---

## Retrieval Tiers / 检索层级

The interceptor automatically selects the best retrieval path:

Interceptor 自动选择最优检索路径：

| Tier / 层级 | Condition / 条件 | Quality / 质量 | How / 方式 |
|---|---|---|---|
| `fallback_strong` | payload has `fallback_text` | High / 高 | Decompress text, re-embed with bge-m3/voyage-3, FAISS search |
| `vector_only` | vectors only, no text | Medium / 中 | Dequantize 384d MiniLM vectors, same-space cosine similarity |

You can check which tier was used from the `Document.metadata`:

可以从 `Document.metadata` 查看使用了哪个层级：

```python
from rag_interceptor import TZPRetriever

retriever = TZPRetriever(payload=payload, rag_config=config.rag, chunk_config=config.chunk)
docs = retriever.invoke("your query")

for doc in docs:
    print(doc.metadata["retrieval_tier"])    # "fallback_strong" or "vector_only"
    print(doc.metadata["embedding_model"])   # "bge-m3", "minilm", etc.
    print(doc.metadata["score"])             # cosine similarity score
    print(doc.metadata["source_type"])       # "fallback_text" or "dequantized_vector"
```

---

## Caching Behavior / 缓存行为

The interceptor caches at 4 levels. The second call with the same `trex_id` skips all expensive operations:

Interceptor 有 4 级缓存。第二次命中同一 `trex_id` 时跳过所有昂贵操作：

| Level / 层级 | What / 内容 | First Call / 首次 | Cached Call / 缓存命中 |
|---|---|---|---|
| L1 | Raw payload | ~50-200ms (HTTP) | 0ms |
| L2 | Decompressed text | ~1-5ms | 0ms |
| L3 | Chunk list | ~1ms | 0ms |
| L4 | FAISS index | ~200-500ms (embedding) | 0ms |

Access cache stats programmatically:

编程访问缓存统计：

```python
async with TZPInterceptor(config) as interceptor:
    await interceptor.process(prompt, query)
    print(interceptor.cache.stats())
    # {'entries': 4, 'max_entries': 128, 'hits': 2, 'misses': 3}
```

---

## Error Handling / 错误处理

When a TZP payload fetch fails, the behavior depends on `error_mode`:

当 TZP payload 拉取失败时，行为取决于 `error_mode`：

| Mode / 模式 | Output / 输出 | Use Case / 场景 |
|---|---|---|
| `placeholder` | `[TZP_ERROR: tx_us_xxx: TREX_NOT_FOUND]` | Development, debugging / 开发调试 |
| `silent_skip` | *(marker removed, nothing injected)* | Production, graceful degradation / 生产优雅降级 |
| `summary` | `(Context tx_us_xxx is temporarily unavailable)` | User-facing apps / 面向用户的应用 |

A single payload failure never crashes the entire pipeline. Other markers in the same prompt are processed normally.

单个 payload 失败不会导致整个 pipeline 崩溃。同一 prompt 中的其他标记正常处理。

---

## Quick Decision Guide / 快速选择指南

| Scenario / 场景 | Use / 使用 |
|---|---|
| Building a new RAG chain from scratch / 从零搭建 RAG chain | `TZPRunnable` |
| Existing ChatModel code, want TZP support with zero changes / 已有 ChatModel 代码，想零改动加 TZP | `TZPChatModel` |
| LangChain Agent with tools / LangChain Agent + Tools | `TZPChatModel` (wrap the agent's LLM) |
| Need full control over pull/retrieve/inject / 需要完全控制流程 | `TZPInterceptor` directly |
| Just need a retriever for an existing vector store workflow / 只需要检索器 | `TZPRetriever` directly |

---

## Complete Example / 完整示例

```python
"""End-to-end: Push context via TrexAPI, then query via LangChain."""
import asyncio
import base64
import numpy as np
import zstandard as zstd
import httpx

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from rag_interceptor import TZPRunnable, build_config

TREX_URL = "http://localhost:3000"
API_KEY = "your_dev_api_key"

async def main():
    # ── Step 1: Push a document (simulating Agent A) ──
    text = (
        "The Federal Reserve signaled a pause in rate hikes during Q1 2026. "
        "GDP growth slowed to 1.8%. Tech sector showed AI-driven resilience. "
        "Consumer spending declined 2.3% in January."
    )
    compressor = zstd.ZstdCompressor()
    fb_b64 = base64.b64encode(compressor.compress(text.encode())).decode()

    vectors_b64 = []
    quant_params = []
    for _ in range(3):
        v = np.random.randint(-128, 127, size=384, dtype=np.int8)
        vectors_b64.append(base64.b64encode(v.tobytes()).decode())
        quant_params.append({"min": -3.0, "max": 4.0, "method": "percentile_99_9_int8"})

    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{TREX_URL}/v1/payloads", json={
            "tzp_version": "1.0",
            "payload": {
                "vector_seq_b64": vectors_b64,
                "quant_params": quant_params,
                "dimensions": 384,
                "chunk_count": 3,
                "fallback_text_zstd_b64": fb_b64,
                "summary": "Q1 2026 Fed analysis",
            },
            "metadata": {"sender_agent_id": "demo", "ttl_seconds": 3600},
        }, headers={"Authorization": f"Bearer {API_KEY}"})

    trex_id = resp.json()["trex_id"]
    print(f"Pushed: {trex_id}")

    # ── Step 2: Query via LangChain (simulating Agent B) ──
    config = build_config(api_key=API_KEY, embedding_model="minilm", top_k=3)
    chain = (
        TZPRunnable(interceptor_config=config)
        | ChatPromptTemplate.from_template("Context: {context}\n\nQuestion: {question}")
        | ChatOpenAI(model="gpt-4o")
    )

    result = await chain.ainvoke({
        "context": f"[TZP: {trex_id}]",
        "question": "What did the Fed signal?",
    })
    print(f"Answer: {result.content}")

asyncio.run(main())
```
