# TZP RAG Interceptor — 部署与测试指南

## 架构总览

```
┌─────────────────┐     HTTPS POST      ┌──────────────┐
│  Push 端 Agent   │ ──────────────────▶ │   TrexAPI    │
│  (MiniLM 384d)  │    /v1/payloads     │  Edge Server │
└─────────────────┘                      └──────┬───────┘
                                                │ GET /v1/payloads/:id
┌─────────────────┐     process()        ┌──────▼───────┐
│  下游 LLM       │ ◀───────────────── │ RAG Interceptor│
│  (GPT-4o 等)    │   注入 context      │  (Python)     │
└─────────────────┘                      └──────────────┘
```

两种 LangChain 集成模式：

| 模式 | 类 | 适用场景 |
|------|-----|---------|
| LCEL Runnable | `TZPRunnable` | 插入 chain 最前面，自动展开 `[TZP: ...]` |
| ChatModel Wrapper | `TZPChatModel` | 包装任意 ChatModel，透明拦截消息 |

---

## 一、环境准备

### 1.1 系统要求

- Python >= 3.9
- Node.js >= 18（运行 TrexAPI 服务端）
- 约 2GB 磁盘空间（bge-m3 模型约 1.3GB）

### 1.2 安装 Python 依赖

```bash
cd TrexAPI
python3 -m venv .venv
source .venv/bin/activate
pip install -r rag_interceptor/requirements.txt
```

核心依赖清单：

| 包 | 用途 |
|----|------|
| `langchain-core` | BaseRetriever / LCEL / BaseChatModel |
| `faiss-cpu` | 内存向量索引 |
| `httpx` | 异步 HTTP 客户端 |
| `numpy` | 向量运算 |
| `zstandard` | fallback_text 解压 |
| `sentence-transformers` | bge-m3 / MiniLM 本地推理 |
| `voyageai` | Voyage-3 API（可选） |

如果要跑 LangChain 集成测试，还需要：

```bash
pip install langchain-openai  # 或其他 LLM provider
```

### 1.3 启动 TrexAPI 服务端

```bash
cd TrexAPI
npm install
npm run build
npm run start
```

默认监听 `http://localhost:3000`。

### 1.4 环境变量

```bash
# .env 或 export
export TREX_API_KEY="your_dev_api_key_here"    # 对应 .env.example 中的 DEV_API_KEY
export VOYAGE_API_KEY="voy-..."                 # 可选，仅 voyage-3 模式需要
export OPENAI_API_KEY="sk-..."                  # 可选，仅 LangChain 集成测试需要
```

---

## 二、基本用法

### 2.1 直接使用 Interceptor

```python
import asyncio
from rag_interceptor import TZPInterceptor, build_config

config = build_config(
    api_key="your_dev_api_key_here",
    api_base_url="http://localhost:3000",
    embedding_model="bge-m3",          # 或 "voyage-3" / "minilm"
    top_k=5,
    max_inject_tokens=500,
    error_mode="placeholder",           # "placeholder" / "silent_skip" / "summary"
)

async def main():
    async with TZPInterceptor(config) as interceptor:
        prompt = "请基于以下背景分析：[TZP: tx_us_8f9A2bXr7]"
        result = await interceptor.process(prompt, "Q1 市场趋势如何？")
        print(result)

asyncio.run(main())
```

### 2.2 LCEL Chain 模式（TZPRunnable）

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from rag_interceptor import TZPRunnable, build_config

config = build_config(api_key="...", embedding_model="bge-m3")

chain = (
    TZPRunnable(interceptor_config=config)
    | ChatPromptTemplate.from_template("Context: {context}\n\nQuestion: {question}")
    | ChatOpenAI(model="gpt-4o")
)

# 同步调用
result = chain.invoke({
    "context": "参考资料：[TZP: tx_us_8f9A2bXr7]",
    "question": "请总结关键风险点",
})
print(result.content)
```

### 2.3 ChatModel Wrapper 模式（TZPChatModel）

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from rag_interceptor import TZPChatModel, build_config

config = build_config(api_key="...", embedding_model="bge-m3")

model = TZPChatModel(
    inner=ChatOpenAI(model="gpt-4o"),
    interceptor_config=config,
)

# 任何消息中的 [TZP: ...] 都会被自动展开
result = model.invoke([
    HumanMessage("基于 [TZP: tx_us_8f9A2bXr7] 的内容，请分析市场趋势")
])
print(result.content)
```

---

## 三、配置参数速查

### build_config() 参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `api_base_url` | `http://localhost:3000` | TrexAPI 地址 |
| `api_key` | env `TREX_API_KEY` | API 密钥 |
| `timeout` | `10.0` | HTTP 超时（秒） |
| `embedding_model` | `bge-m3` | 强模型（`bge-m3` / `voyage-3` / `minilm`） |
| `top_k` | `5` | 检索返回的 chunk 数 |
| `voyage_api_key` | env `VOYAGE_API_KEY` | Voyage API 密钥 |
| `chunk_size` | `256` | 分块 token 大小 |
| `chunk_overlap` | `32` | 分块重叠 token 数 |
| `chunk_strategy` | `payload_first` | `payload_first` 优先用 payload 边界 |
| `max_tzp_tags` | `5` | 单次最多处理的 TZP 标记数 |
| `max_inject_tokens` | `500` | 注入 prompt 的最大 token 数 |
| `error_mode` | `placeholder` | 失败策略 |
| `inject_with_source_label` | `True` | 注入时是否带来源标记 |

### 检索层级（RetrievalTier）

| 层级 | 触发条件 | 质量 |
|------|----------|------|
| `fallback_strong` | payload 有 `fallback_text_zstd_b64` | 高（强模型重编码） |
| `vector_only` | 仅有量化向量 | 中（MiniLM 同空间） |

---

## 四、测试流程

### 4.1 逐层单元测试

在项目根目录执行以下测试脚本（见 `tests/test_rag_interceptor.py`）：

```bash
source .venv/bin/activate
python tests/test_rag_interceptor.py
```

测试覆盖：

| 层 | 测试内容 |
|----|---------|
| `models` | enum 值、dataclass 默认值、InterceptorConfig 组装 |
| `parser` | 标记检测、转义排除、代码块排除、多标记、replace |
| `cache` | LRU 淘汰、cache_key 生成、stats 统计 |
| `budget` | tag/chunk/text/injection 截断 |
| `chunking` | payload_first 对齐、token overlap 分块 |
| `dequantize` | Int8→Float32 精度验证 |
| `config` | build_config 工厂 |

### 4.2 端到端集成测试

需要 TrexAPI 服务端运行。流程：

```
1. Push 一个带 fallback_text 的 payload → 拿到 trex_id
2. 构造含 [TZP: trex_id] 的 prompt
3. 调用 interceptor.process()
4. 验证输出中包含检索到的上下文
5. 再次调用 → 验证缓存命中（无 HTTP 请求）
```

### 4.3 性能基准

| 指标 | 首次（冷启动） | 二次（缓存命中） |
|------|--------------|-----------------|
| Pull latency | ~50-200ms | 0ms (cache) |
| Decompress | ~1-5ms | 0ms (cache) |
| Embedding (20 chunks, bge-m3) | ~200-500ms | 0ms (cache) |
| FAISS index build | ~1ms | 0ms (cache) |
| FAISS search | ~0.1ms | ~0.1ms |
| **Total** | **~300-700ms** | **~0.2ms** |

---

## 五、生产部署清单

### 5.1 必须完成

- [ ] TrexAPI 服务端部署（Cloudflare Workers 或自建）
- [ ] Python 依赖锁定（`pip freeze > requirements.lock`）
- [ ] `TREX_API_KEY` 通过 Secret Manager 注入
- [ ] embedding 模型预下载（避免首次运行时下载）
- [ ] 日志级别配置（`logging.getLogger("rag_interceptor").setLevel(...)`)

### 5.2 推荐优化

- [ ] 启动时预热 embedding 模型（`get_embedding_model(config)`）
- [ ] 高频 trex_id 预加载到缓存
- [ ] `BudgetConfig` 根据业务场景调参
- [ ] 监控 `InterceptorCache.stats()` 命中率

### 5.3 预下载模型

```bash
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('BAAI/bge-m3')"
```

首次会下载约 1.3GB，后续从本地加载。
