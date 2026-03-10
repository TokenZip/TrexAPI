# TrexAPI 参考实现部署文档

本文档提供有关如何配置、构建并部署 **TokenZip Protocol (TZP)** 的核心网关组件 `TrexAPI` 的完整说明。

---

## 目录

1. [概述](#概述)
2. [项目结构](#项目结构)
3. [前置环境要求](#前置环境要求)
4. [安装与配置](#安装与配置)
5. [启动服务](#启动服务)
6. [API 参考](#api-参考)
7. [鉴权机制](#鉴权机制)
8. [Docker 部署](#docker-部署)
9. [生产环境部署](#生产环境部署)
10. [故障排查](#故障排查)
11. [已知限制与规范差异](#已知限制与规范差异)

---

## 概述

TrexAPI 是 TZP 规范 (v1.0) 中指定的边缘缓存节点兼指针管理服务的参考实现。该服务接收语义特征矩阵，并在代理间以轻量级的 `TrexID` 指针进行流转。

| 项目       | 技术选型                   |
| :--------- | :------------------------ |
| 框架       | Node.js + Hono            |
| 语言       | TypeScript (ESM)          |
| 数据库     | SQLite (`better-sqlite3`) |
| 鉴权       | HMAC-SHA256 / 开发用静态口令 |
| 合规等级   | TZP-Core                  |

---

## 项目结构

```
TrexAPI/
├── src/
│   ├── index.ts              # 应用入口，启动 Hono HTTP 服务
│   ├── db/
│   │   └── index.ts          # SQLite 初始化与表结构定义
│   ├── routes/
│   │   └── payloads.ts       # /v1/payloads 路由（推送、拉取）
│   └── utils/
│       ├── trexId.ts          # TrexID 生成器（CSPRNG + Base62）
│       └── crypto.ts          # 鉴权中间件（HMAC / DEV_API_KEY）
├── dist/                      # TypeScript 编译输出
├── package.json
├── tsconfig.json
├── .env                       # 环境变量（需手动创建）
└── trexapi_v1.db              # SQLite 数据库文件（自动生成）
```

---

## 前置环境要求

| 依赖      | 最低版本   | 说明                          |
| :-------- | :-------- | :---------------------------- |
| Node.js   | v20.0.0   | 需支持 ESM 和原生 `crypto`     |
| npm       | v9+       | 随附 Node.js 安装              |

验证环境：

```bash
node -v   # 应输出 v20.x.x 或更高
npm -v    # 应输出 9.x.x 或更高
```

---

## 安装与配置

### 1. 安装依赖

在项目根目录下运行：

```bash
npm install
```

核心依赖清单：

| 包名                    | 用途                        |
| :---------------------- | :-------------------------- |
| `hono`                  | 轻量级 Web 框架              |
| `@hono/node-server`    | Hono 的 Node.js 适配器       |
| `@hono/zod-validator`  | 请求体校验中间件              |
| `better-sqlite3`       | SQLite 嵌入式数据库驱动       |
| `zod`                   | 运行时类型校验库              |
| `dotenv`                | 环境变量加载                 |

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# 服务端口（默认 3000）
PORT=3000

# 开发模式鉴权口令（仅用于本地开发，生产环境应删除）
DEV_API_KEY=testkey

# 边缘节点区域标识（显示在推送响应的 edge_region 字段中）
TZP_REGION=local-edge-1
```

| 变量           | 必填 | 默认值       | 说明                                                           |
| :------------- | :--: | :---------- | :------------------------------------------------------------- |
| `PORT`         | 否   | `3000`      | HTTP 服务监听端口                                                |
| `DEV_API_KEY`  | 否   | 无          | 开发用简化鉴权口令，设置后可通过 `Bearer <口令>` 直接跳过 HMAC 校验  |
| `TZP_REGION`   | 否   | `local-1`   | 推送响应中返回的 `edge_region` 值                                 |

> **安全警告：** `.env` 文件包含敏感信息，**不得**提交到版本控制。请确保 `.gitignore` 中包含 `.env`。

### 3. 数据库初始化

数据库在首次启动时**自动初始化**。`src/db/index.ts` 中的 `initDb()` 函数会：

1. 在项目根目录创建 `trexapi_v1.db` 文件
2. 建立 `payloads` 表（存储语义载荷）
3. 建立 `api_keys` 表（存储 HMAC 鉴权密钥）

表结构如下：

```sql
-- 语义载荷存储
CREATE TABLE IF NOT EXISTS payloads (
  trex_id       TEXT PRIMARY KEY,
  payload       TEXT NOT NULL,       -- JSON 序列化的载荷数据
  metadata      TEXT NOT NULL,       -- JSON 序列化的元数据
  checksum_sha256 TEXT NOT NULL,
  expires_at    TEXT NOT NULL,       -- ISO 8601 过期时间
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

-- API 密钥（用于 HMAC 鉴权）
CREATE TABLE IF NOT EXISTS api_keys (
  key_id   TEXT PRIMARY KEY,        -- 密钥标识
  secret   TEXT NOT NULL,           -- HMAC 签名密钥
  agent_id TEXT                     -- 关联的 Agent 标识
);
```

如需重置数据库，删除 `trexapi_v1.db` 文件后重启服务即可。

---

## 启动服务

### 本地开发模式

使用以下命令同时启动 TypeScript 增量编译监控与 `nodemon` 守护进程，代码变更时自动重启：

```bash
npm run dev
```

看到以下输出表示启动成功：

```text
[nodemon] starting `node dist/index.js`
Database initialized successfully
Server is running on port 3000
```

### 生产构建

```bash
# 编译 TypeScript 到 dist/
npm run build

# 启动编译后的服务
npm run start
```

### 全部 npm scripts

| 命令               | 说明                                    |
| :----------------- | :-------------------------------------- |
| `npm run dev`      | 开发模式（热重载）                        |
| `npm run build`    | 清理 dist/ 并重新编译                     |
| `npm run start`    | 启动编译后的生产服务                       |
| `npm run watch`    | 仅启动 TypeScript 增量编译监控             |
| `npm run clean`    | 清理 dist/ 目录                          |

---

## API 参考

所有载荷端点均需要鉴权头（详见[鉴权机制](#鉴权机制)章节）。

### 健康检查

```
GET /health
```

无需鉴权。返回纯文本 `TrexAPI is healthy`，用于负载均衡器探活。

### 推送载荷

```
POST /v1/payloads
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**

```json
{
  "tzp_version": "1.0",
  "payload": {
    "vector_seq_b64": ["SGVsbG8=", "V29ybGQ="],
    "quant_params": { "min": -3.412, "max": 4.891, "method": "minmax_int8" },
    "dimensions": 384,
    "chunk_count": 2,
    "summary": "示例上下文推送",
    "source_lang": "zh-CN"
  },
  "metadata": {
    "sender_agent_id": "test_agent_1",
    "ttl_seconds": 3600,
    "allowed_receivers": ["agent_claude_02"],
    "idempotency_key": "idem_abc123"
  }
}
```

| 字段                         | 必填 | 说明                                |
| :--------------------------- | :--: | :--------------------------------- |
| `tzp_version`                | 是   | 协议版本，当前仅支持 `"1.0"`         |
| `payload.vector_seq_b64`     | 是   | Base64 编码的 Int8 量化向量序列       |
| `payload.quant_params`       | 是   | 量化参数（min, max, method）         |
| `payload.dimensions`         | 是   | 单向量维度（正整数）                  |
| `payload.chunk_count`        | 是   | 序列块数（正整数）                   |
| `payload.summary`            | 否   | 人类可读的语义摘要                   |
| `payload.source_lang`        | 否   | 原始文本的语言标识                   |
| `metadata.sender_agent_id`   | 否   | 发送方 Agent 标识                   |
| `metadata.ttl_seconds`       | 否   | 载荷生存时间（秒），默认 86400       |
| `metadata.allowed_receivers` | 否   | 接收方白名单                        |
| `metadata.idempotency_key`   | 否   | 幂等键                             |

**成功响应（201 Created）：**

```json
{
  "trex_id": "tx_aBcDeFgHiJk",
  "edge_region": "local-edge-1",
  "expires_at": "2026-03-11T16:00:00.000Z",
  "payload_size_bytes": 185,
  "checksum_sha256": "a1b2c3..."
}
```

### 拉取载荷

```
GET /v1/payloads/:trex_id
Authorization: Bearer <token>
```

**成功响应（200 OK）：**

```json
{
  "trex_id": "tx_aBcDeFgHiJk",
  "tzp_version": "1.0",
  "payload": { "..." : "..." },
  "metadata": { "..." : "..." },
  "checksum_sha256": "a1b2c3..."
}
```

如果 TrexID 不存在或已过期，返回 404。若请求方不在 `allowed_receivers` 白名单中，返回 403。

### 错误响应格式

所有错误统一返回以下 JSON 结构：

```json
{
  "error": {
    "code": "TREX_NOT_FOUND",
    "message": "The requested TrexID does not exist or has expired.",
    "status": 404
  }
}
```

**错误码一览：**

| 错误码                    | HTTP | 触发条件                       |
| :----------------------- | :--- | :----------------------------- |
| `TREX_UNAUTHORIZED`      | 401  | 鉴权头缺失或签名无效             |
| `TREX_FORBIDDEN`         | 403  | 当前 Agent 不在接收方白名单中     |
| `TREX_NOT_FOUND`         | 404  | TrexID 不存在或已过期            |
| `TREX_BAD_REQUEST`       | 400  | 请求体格式无效或缺少必填字段       |
| `TREX_VERSION_UNSUPPORTED` | 400 | 不支持的 TZP 协议版本            |
| `TREX_INTERNAL_ERROR`    | 500  | 服务内部错误                     |

### 测试示例

**推送载荷：**

```bash
curl -X POST http://localhost:3000/v1/payloads \
  -H "Authorization: Bearer testkey" \
  -H "Content-Type: application/json" \
  -d '{
    "tzp_version": "1.0",
    "payload": {
      "vector_seq_b64": ["SGVsbG8=", "V29ybGQ="],
      "quant_params": { "min": -3.412, "max": 4.891, "method": "minmax_int8" },
      "dimensions": 384,
      "chunk_count": 2,
      "summary": "Mock Context Push",
      "source_lang": "zh-CN"
    },
    "metadata": {
      "sender_agent_id": "test_agent_1"
    }
  }'
```

**拉取载荷：**

```bash
# 将 TrexID 替换为上一步返回的实际值
curl http://localhost:3000/v1/payloads/tx_aBcDeFgHiJk \
  -H "Authorization: Bearer testkey"
```

**健康检查：**

```bash
curl http://localhost:3000/health
# 输出: TrexAPI is healthy
```

---

## 鉴权机制

所有 `/v1/payloads` 下的端点均受 `authMiddleware` 保护。支持两种鉴权模式：

### 模式 A：开发用静态口令

当 `.env` 中配置了 `DEV_API_KEY` 时，可使用该口令直接通过鉴权：

```
Authorization: Bearer testkey
```

此模式下，请求方的 `agent_id` 固定为 `agent_dev_01`。

> **仅限开发环境使用。** 生产部署时应删除 `DEV_API_KEY` 环境变量。

### 模式 B：HMAC 签名鉴权

生产环境使用 `api_keys` 表中的密钥对进行签名校验：

```
Authorization: Bearer <key_id>:<hmac_signature>
```

签名生成方式：`HMAC-SHA256(secret, key_id)`，输出十六进制字符串。

**注册 API 密钥：**

通过 SQLite CLI 手动插入密钥：

```bash
# 打开数据库（确保服务已至少启动过一次以创建数据库文件）
sqlite3 trexapi_v1.db
```

```sql
-- 插入一个 API 密钥
INSERT INTO api_keys (key_id, secret, agent_id)
VALUES ('mykey01', 'a_strong_random_secret_at_least_32_bytes', 'agent_gpt4_research_01');

-- 验证
SELECT * FROM api_keys;
```

**生成签名（示例）：**

```bash
# 使用 OpenSSL 生成 HMAC 签名
echo -n "mykey01" | openssl dgst -sha256 -hmac "a_strong_random_secret_at_least_32_bytes"
# 输出类似: d7a8fbb...

# 使用生成的签名发起请求
curl http://localhost:3000/v1/payloads/tx_aBcDeFgHiJk \
  -H "Authorization: Bearer mykey01:d7a8fbb..."
```

**使用 Node.js 生成签名：**

```javascript
import crypto from 'crypto';
const signature = crypto.createHmac('sha256', 'a_strong_random_secret_at_least_32_bytes')
  .update('mykey01')
  .digest('hex');
console.log(`mykey01:${signature}`);
```

---

## Docker 部署

项目未内置 Dockerfile。以下提供推荐的容器化配置。

### Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### docker-compose.yml

```yaml
services:
  trexapi:
    build: .
    ports:
      - "3000:3000"
    environment:
      PORT: "3000"
      TZP_REGION: "asia-east1"
    volumes:
      - trexapi-data:/app
    restart: unless-stopped

volumes:
  trexapi-data:
```

### 构建与运行

```bash
# 构建镜像
docker build -t trexapi:latest .

# 直接运行
docker run -d \
  --name trexapi \
  -p 3000:3000 \
  -e TZP_REGION=asia-east1 \
  -v trexapi-data:/app \
  trexapi:latest

# 或使用 docker-compose
docker compose up -d
```

> **注意：** SQLite 数据库文件 `trexapi_v1.db` 会在容器内的 `/app` 目录生成。使用 volume 挂载确保数据持久化，否则容器重建后数据丢失。

---

## 生产环境部署

### 反向代理配置

建议在 TrexAPI 前部署 Nginx 或 Caddy 作为反向代理，处理 TLS 终结和请求限流。

**Nginx 示例配置：**

```nginx
server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate     /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;
    ssl_protocols       TLSv1.3;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 请求体大小限制（对应 TREX_PAYLOAD_TOO_LARGE）
        client_max_body_size 1m;
    }
}
```

### 进程管理

使用 PM2 管理 Node.js 进程，提供自动重启、日志管理和集群模式：

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start dist/index.js --name trexapi

# 常用命令
pm2 status          # 查看状态
pm2 logs trexapi    # 查看日志
pm2 restart trexapi # 重启
pm2 stop trexapi    # 停止

# 开机自启
pm2 startup
pm2 save
```

### 安全加固清单

| 项目                    | 操作                                                        |
| :---------------------- | :---------------------------------------------------------- |
| 禁用开发口令            | 删除 `.env` 中的 `DEV_API_KEY`                               |
| 强制 HTTPS              | 通过反向代理配置 TLS 1.3，禁止明文 HTTP                        |
| 限制请求体大小           | Nginx `client_max_body_size 1m` 或应用层校验                  |
| 数据库文件权限           | `chmod 600 trexapi_v1.db`，确保仅运行用户可读写                |
| 定期清理过期载荷         | 设置 cron 任务执行 `DELETE FROM payloads WHERE expires_at < datetime('now')` |
| 日志审计                | 配合 PM2 或集中式日志系统保留操作日志 ≥ 90 天                    |

### 过期载荷清理

当前实现在拉取时检查过期状态，但不会主动清理数据库中的过期记录。建议设置定时任务：

```bash
# 添加 cron 任务，每小时清理一次过期载荷
crontab -e
```

```cron
0 * * * * sqlite3 /path/to/trexapi_v1.db "DELETE FROM payloads WHERE expires_at < datetime('now');"
```

---

## 故障排查

### 启动失败

| 症状                                      | 可能原因                  | 解决方案                                      |
| :---------------------------------------- | :----------------------- | :-------------------------------------------- |
| `Cannot find module './routes/payloads.js'` | 未编译 TypeScript         | 运行 `npm run build` 后再启动                  |
| `Error: Could not locate the bindings file` | `better-sqlite3` 原生模块编译失败 | 确保已安装 C++ 构建工具链，运行 `npm rebuild`   |
| `EADDRINUSE: address already in use`       | 端口被占用                | 修改 `.env` 中的 `PORT` 或终止占用端口的进程     |
| `Database initialized` 后无 `Server is running` | 端口绑定异常            | 检查 `PORT` 环境变量是否为合法数字              |

### 请求错误

| 症状                          | 可能原因                          | 解决方案                                        |
| :---------------------------- | :------------------------------- | :---------------------------------------------- |
| 401 `TREX_UNAUTHORIZED`      | `Authorization` 头缺失或口令错误  | 检查请求头格式 `Bearer <token>`，核对 `DEV_API_KEY` |
| 400 `TREX_BAD_REQUEST`       | 请求体 JSON 格式不符合 Schema     | 检查必填字段（`vector_seq_b64`, `quant_params` 等） |
| 400 `TREX_VERSION_UNSUPPORTED` | `tzp_version` 值不是 `"1.0"`   | 修改请求中的 `tzp_version` 为 `"1.0"`             |
| 404 `TREX_NOT_FOUND`         | TrexID 不存在或已过期             | 确认 ID 正确，检查 TTL 是否已过期                  |
| 500 `TREX_INTERNAL_ERROR`    | 数据库写入失败等服务端异常         | 查看服务日志，检查磁盘空间和数据库文件权限           |

### 数据库操作

```bash
# 直接查询数据库
sqlite3 trexapi_v1.db

# 常用查询
.tables                                          -- 查看所有表
SELECT trex_id, expires_at FROM payloads;        -- 查看所有载荷
SELECT * FROM api_keys;                          -- 查看所有 API 密钥
SELECT COUNT(*) FROM payloads WHERE expires_at < datetime('now');  -- 统计过期载荷
DELETE FROM payloads WHERE expires_at < datetime('now');           -- 清理过期载荷
```

---

## 已知限制与规范差异

本参考实现为 **TZP-Core** 等级，以下功能尚未实现或与 TZP v1.0 规范存在差异：

| 规范要求                          | 当前状态                                                  |
| :------------------------------- | :------------------------------------------------------- |
| TrexID 含区域码（15 字符）         | 当前生成 `tx_` + 11 位 Base62（14 字符），未嵌入区域路由码 |
| 载荷撤销 API (`DELETE`)           | 未实现（规范 5.4 节）                                     |
| `quant_params` 分块模式           | 仅支持全局单一对象，不支持 per-chunk 数组                   |
| `tzp_version` 三段式 SemVer       | 当前校验和返回值使用 `"1.0"` 而非 `"1.0.0"`                |
| HMAC Token 规范签名消息体          | 当前简化为 `HMAC(secret, key_id)`，未包含时间戳和路径       |
| Nonce 防重放校验                   | 未实现                                                    |
| AES-256-GCM 静态加密              | 载荷以明文 JSON 存储在 SQLite 中                           |
| E2EE 端到端加密                   | 未实现                                                    |
| 速率限制                          | 未实现（需在反向代理层或应用层补充）                        |
| `allowed_receivers` 白名单校验    | 已实现（拉取时校验 `agent_id`）                            |
| 过期载荷主动清理                   | 仅在拉取时被动检查，不主动清除                              |
| `preferred_region` 数据驻留       | 未实现                                                    |
| 审计日志（保留 ≥ 90 天）           | 未实现（可通过反向代理访问日志补充）                        |

这些差异是参考实现为简化本地部署而做的有意取舍。生产级部署应逐步对齐规范要求。
