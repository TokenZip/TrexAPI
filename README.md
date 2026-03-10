# TrexAPI

**TokenZip Protocol (TZP) Reference API Gateway — Edge cache, pointer management & access control**

**TokenZip 协议 (TZP) 参考 API 网关 — 边缘缓存、指针管理与访问控制**

**Official site 官网:** [tokenzip.org](https://tokenzip.org) · **Contact 联系:** [dev@tokenzip.org](mailto:dev@tokenzip.org)

[![TZP](https://img.shields.io/badge/TZP-1.0.0-blue)](https://github.com/tokenzip/tzp-spec) [![Compliance](https://img.shields.io/badge/Compliance-TZP--Network-green)](./TZP-v1.0-Specification.md)

---

## English

### What is TZP?

**TokenZip Protocol (TZP)** is an open standard for **semantic shared memory** between heterogeneous AI agents. It cuts multi-agent communication cost by **pass-by-reference**: instead of sending full context (thousands of tokens), agents exchange short pointers (**TrexID**) and fetch compressed semantic payloads from the edge.

- **~80%+** smaller payload size (vector quantization)
- **~95%+** lower latency and API cost vs. full-token transfer
- **Model-agnostic**: GPT, Claude, Llama, Gemini, etc. share one 384-d **Interlingua** space

### What is TrexAPI?

**TrexAPI** is the reference implementation of the TZP edge gateway: it accepts semantic payloads (POST), stores them, returns **TrexID** pointers, and serves payloads on GET. Use it to run your own TZP-compliant edge node.

| Stack        | Choice                    |
| ------------ | ------------------------- |
| Runtime      | Node.js 20+               |
| Framework    | [Hono](https://hono.dev/) |
| Language     | TypeScript (ESM)          |
| Database     | SQLite (default) / PostgreSQL |
| Compliance   | TZP-Network               |

### Design principles (TZP)

1. **Map, don’t translate** — One 384-d Interlingua space (e.g. `all-MiniLM-L6-v2`), no cross-model full-dimension translation.
2. **Pass by reference, not value** — Send `[TZP: tx_us_8f9A2bXr7]` instead of 10,000 tokens.
3. **Open-first, security built-in** — AES-256-GCM at rest, HMAC-signed tokens, optional E2EE.

### Quick start

```bash
# Clone and install
git clone https://github.com/tokenzip/trex-api.git && cd trex-api
npm install

# Configure (copy .env.example to .env; set PORT, TZP_REGION; for dev, set DEV_API_KEY)
cp .env.example .env

# Build and run
npm run build && npm start
```

Default: `http://localhost:3000`. See **[Deployment](#deployment--部署)** below for production.

### Deployment / 部署

| Step | Command / 命令 |
|------|----------------|
| **1. Env** | Copy `.env.example` → `.env`, set `PORT` (default 3000), `TZP_REGION`. For dev only: `DEV_API_KEY=testkey`. |
| **2. Dev** | `npm run dev` — hot reload. |
| **3. Prod** | `npm run build && npm start`. |
| **4. Docker** | `docker build -t trexapi . && docker run -d -p 3000:3000 -e DEV_API_KEY=testkey trexapi` (or use [docker-compose](https://docs.docker.com/compose/) with a `Dockerfile` in repo). |

**Production checklist:** Remove `DEV_API_KEY`; use HMAC auth (see [Deployment: EN](./DEPLOYMENT.md) | [中文](./DEPLOYMENT_zh.md)); put behind HTTPS (e.g. Nginx/Caddy).

**部署速览：** 复制 `.env.example` 为 `.env`，配置 `PORT`、`TZP_REGION`；开发可设 `DEV_API_KEY=testkey`。开发用 `npm run dev`，生产用 `npm run build && npm start`。Docker 构建后 `-p 3000:3000` 并传入环境变量即可。生产环境务必去掉 `DEV_API_KEY`、启用 HMAC 鉴权并配置 HTTPS，详见 [部署文档 EN](./DEPLOYMENT.md) | [中文](./DEPLOYMENT_zh.md)。

### API overview

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/payloads` | Push semantic payload → returns `trex_id` |
| `GET`  | `/v1/payloads/:trex_id` | Pull payload by TrexID |
| `HEAD` | `/v1/payloads/:trex_id` | Probe status (no body) |
| `DELETE` | `/v1/payloads/:trex_id` | Revoke payload (sender only) |

All requests require `Authorization: Bearer <hmac_signed_token>`. See [TZP v1.0 Specification](./TZP-v1.0-Specification.md) for payload schema, TrexID format, and error codes.

### Security

- **TLS 1.3+** for transport.
- **AES-256-GCM** for payloads at rest.
- **HMAC-SHA256** Bearer tokens; optional **E2EE** and receiver allowlists (`allowed_receivers`).
- **Nonce** and timestamp checks to mitigate replay.

### Compliance & spec

- Implements **TZP-Network**: push/pull API, TrexID generation, edge storage, access control.
- Full protocol: [TZP v1.0 Specification](./TZP-v1.0-Specification.md).
- Official SDKs: [tokenzip-python](https://github.com/tokenzip/tokenzip-python), [tokenzip-ts](https://github.com/tokenzip/tokenzip-ts).

### License

Apache 2.0. TZP specification: Apache 2.0 / CC-BY-SA 4.0 (dual-licensed).

---

## 中文

### TZP 是什么？

**TokenZip 协议 (TZP)** 是一套面向**异构 AI 代理**的**语义共享内存**开放标准。通过**传指针而非传全文**，将多智能体协作时的通信带宽与成本大幅降低：代理之间只交换短指针 **TrexID**，再从边缘节点拉取压缩后的语义载荷。

- **约 80% 以上**的载荷体积压缩（向量量化）
- **约 95% 以上**的延迟与 API 成本降低（相对全量 Token 传输）
- **与模型无关**：GPT、Claude、Llama、Gemini 等共用同一 384 维 **Interlingua** 空间

### TrexAPI 是什么？

**TrexAPI** 是 TZP 边缘网关的**参考实现**：接收语义载荷（POST）、落库、返回 **TrexID** 指针，并通过 GET 按 TrexID 返回载荷。可用于自建符合 TZP 的边缘节点。

| 技术栈     | 选型                         |
| ---------- | ---------------------------- |
| 运行环境   | Node.js 20+                  |
| 框架       | [Hono](https://hono.dev/)    |
| 语言       | TypeScript (ESM)             |
| 数据库     | SQLite（默认）/ PostgreSQL   |
| 合规等级   | TZP-Network                  |

### 设计原则（TZP）

1. **不翻译，只映射** — 统一 384 维 Interlingua 空间（如 `all-MiniLM-L6-v2`），不做跨模型全维度翻译。
2. **传指针，不传值** — 只传 `[TZP: tx_us_8f9A2bXr7]`，不传上万 Token。
3. **开放优先，安全内建** — 静态加密 AES-256-GCM、HMAC 签名令牌，可选端到端加密。

### 快速开始

```bash
# 克隆并安装
git clone https://github.com/tokenzip/trex-api.git && cd trex-api
npm install

# 配置（复制 .env.example 为 .env；设置 PORT、TZP_REGION；开发可设 DEV_API_KEY）
cp .env.example .env

# 构建并运行
npm run build && npm start
```

默认监听：`http://localhost:3000`。生产部署与步骤见 **[Deployment / 部署](#deployment--部署)**（上文已含中英双语速览；完整文档 [EN](./DEPLOYMENT.md) | [中文](./DEPLOYMENT_zh.md)）。

### API 概览

| 方法     | 路径 | 说明 |
|----------|------|------|
| `POST`   | `/v1/payloads` | 推送语义载荷 → 返回 `trex_id` |
| `GET`    | `/v1/payloads/:trex_id` | 按 TrexID 拉取载荷 |
| `HEAD`   | `/v1/payloads/:trex_id` | 探测状态（无响应体） |
| `DELETE` | `/v1/payloads/:trex_id` | 撤销载荷（仅发送方） |

所有请求需携带 `Authorization: Bearer <hmac_signed_token>`。载荷结构、TrexID 格式与错误码见 [TZP v1.0 规范](./TZP-v1.0-Specification.md)。

### 安全

- **TLS 1.3+** 传输。
- **AES-256-GCM** 静态加密载荷。
- **HMAC-SHA256** Bearer 令牌；可选 **E2EE** 与接收方白名单（`allowed_receivers`）。
- **Nonce** 与时间戳校验，降低重放风险。

### 合规与规范

- 实现 **TZP-Network**：推送/拉取 API、TrexID 生成、边缘存储与访问控制。
- 完整协议：[TZP v1.0 规范](./TZP-v1.0-Specification.md)。
- 官方 SDK：[tokenzip-python](https://github.com/tokenzip/tokenzip-python)、[tokenzip-ts](https://github.com/tokenzip/tokenzip-ts)。

### 许可证

Apache 2.0。TZP 规范：Apache 2.0 / CC-BY-SA 4.0（双许可）。

---

*TokenZip Protocol is an open standard. **Website 官网:** [tokenzip.org](https://tokenzip.org) · **Contact 联系:** [dev@tokenzip.org](mailto:dev@tokenzip.org) · Contributions: [tzp-spec](https://github.com/tokenzip/tzp-spec) | [trex-api](https://github.com/tokenzip/trex-api).*
