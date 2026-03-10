# TrexAPI Reference Implementation — Deployment Guide

This document describes how to configure, build, and deploy **TrexAPI**, the reference implementation of the **TokenZip Protocol (TZP)** edge gateway.

---

## Table of contents

1. [Overview](#overview)
2. [Project structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Installation and configuration](#installation-and-configuration)
5. [Starting the service](#starting-the-service)
6. [API reference](#api-reference)
7. [Authentication](#authentication)
8. [Docker deployment](#docker-deployment)
9. [Production deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)
11. [Known limitations and spec gaps](#known-limitations-and-spec-gaps)

---

## Overview

TrexAPI is the TZP v1.0 reference implementation for the edge cache and pointer management service. It accepts semantic feature matrices and exposes them to agents via lightweight `TrexID` pointers.

| Item        | Stack                         |
| :---------- | :---------------------------- |
| Framework   | Node.js + Hono                |
| Language    | TypeScript (ESM)              |
| Database    | SQLite (`better-sqlite3`)     |
| Auth        | HMAC-SHA256 / dev static key  |
| Compliance  | TZP-Core                      |

---

## Project structure

```
TrexAPI/
├── src/
│   ├── index.ts              # App entry, Hono HTTP server
│   ├── db/
│   │   └── index.ts          # SQLite init and schema
│   ├── routes/
│   │   └── payloads.ts       # /v1/payloads (push/pull)
│   └── utils/
│       ├── trexId.ts         # TrexID generator (CSPRNG + Base62)
│       └── crypto.ts         # Auth middleware (HMAC / DEV_API_KEY)
├── dist/                     # TypeScript build output
├── package.json
├── tsconfig.json
├── .env                      # Environment (create manually)
└── trexapi_v1.db             # SQLite DB (created on first run)
```

---

## Prerequisites

| Dependency | Minimum   | Notes                          |
| :---------- | :-------- | :----------------------------- |
| Node.js    | v20.0.0   | ESM and native `crypto`        |
| npm        | v9+       | Bundled with Node.js           |

Check versions:

```bash
node -v   # v20.x.x or higher
npm -v    # 9.x.x or higher
```

---

## Installation and configuration

### 1. Install dependencies

From the project root:

```bash
npm install
```

Main dependencies:

| Package                 | Purpose                    |
| :---------------------- | :------------------------- |
| `hono`                  | Web framework              |
| `@hono/node-server`     | Hono Node adapter          |
| `@hono/zod-validator`   | Request validation          |
| `better-sqlite3`        | SQLite driver              |
| `zod`                   | Runtime validation          |
| `dotenv`                | Env loading                |

### 2. Environment variables

Create a `.env` file in the project root:

```env
# HTTP port (default 3000)
PORT=3000

# Dev-only auth key (remove in production)
DEV_API_KEY=testkey

# Edge region id (returned in push response as edge_region)
TZP_REGION=local-edge-1
```

| Variable      | Required | Default   | Description                                                |
| :------------ | :------: | :-------- | :--------------------------------------------------------- |
| `PORT`        | No      | `3000`    | HTTP listen port                                           |
| `DEV_API_KEY` | No      | —         | Dev auth key; when set, `Bearer <key>` bypasses HMAC       |
| `TZP_REGION`  | No      | `local-1` | Value for `edge_region` in push responses                  |

> **Security:** Do not commit `.env`. Ensure `.gitignore` includes `.env`.

### 3. Database initialization

The database is created automatically on first start. `initDb()` in `src/db/index.ts`:

1. Creates `trexapi_v1.db` in the project root
2. Creates `payloads` (semantic payloads)
3. Creates `api_keys` (HMAC auth keys)

Schema:

```sql
CREATE TABLE IF NOT EXISTS payloads (
  trex_id       TEXT PRIMARY KEY,
  payload       TEXT NOT NULL,
  metadata      TEXT NOT NULL,
  checksum_sha256 TEXT NOT NULL,
  expires_at    TEXT NOT NULL,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_keys (
  key_id   TEXT PRIMARY KEY,
  secret   TEXT NOT NULL,
  agent_id TEXT
);
```

To reset: delete `trexapi_v1.db` and restart.

---

## Starting the service

### Development

TypeScript watch + nodemon (restart on file changes):

```bash
npm run dev
```

Expected output:

```text
[nodemon] starting `node dist/index.js`
Database initialized successfully
Server is running on port 3000
```

### Production build

```bash
npm run build
npm run start
```

### npm scripts

| Command            | Description              |
| :----------------- | :----------------------- |
| `npm run dev`      | Dev with hot reload      |
| `npm run build`    | Clean and compile        |
| `npm run start`    | Run production build     |
| `npm run watch`    | TypeScript watch only    |
| `npm run clean`    | Remove dist/             |

---

## API reference

All payload endpoints require an auth header (see [Authentication](#authentication)).

### Health check

```
GET /health
```

No auth. Returns plain text `TrexAPI is healthy` for load balancers.

### Push payload

```
POST /v1/payloads
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body:**

```json
{
  "tzp_version": "1.0",
  "payload": {
    "vector_seq_b64": ["SGVsbG8=", "V29ybGQ="],
    "quant_params": { "min": -3.412, "max": 4.891, "method": "minmax_int8" },
    "dimensions": 384,
    "chunk_count": 2,
    "summary": "Example context push",
    "source_lang": "en"
  },
  "metadata": {
    "sender_agent_id": "test_agent_1",
    "ttl_seconds": 3600,
    "allowed_receivers": ["agent_claude_02"],
    "idempotency_key": "idem_abc123"
  }
}
```

| Field                       | Required | Description                    |
| :-------------------------- | :------: | :----------------------------- |
| `tzp_version`               | Yes      | Use `"1.0"`                   |
| `payload.vector_seq_b64`   | Yes      | Base64 Int8 vector sequence    |
| `payload.quant_params`     | Yes      | min, max, method               |
| `payload.dimensions`       | Yes      | Vector dimension               |
| `payload.chunk_count`      | Yes      | Number of chunks               |
| `payload.summary`          | No       | Human-readable summary         |
| `payload.source_lang`      | No       | Source language                |
| `metadata.sender_agent_id` | No       | Sender agent id                |
| `metadata.ttl_seconds`     | No       | TTL in seconds (default 86400)|
| `metadata.allowed_receivers`| No      | Receiver allowlist             |
| `metadata.idempotency_key` | No       | Idempotency key                |

**Success (201 Created):**

```json
{
  "trex_id": "tx_aBcDeFgHiJk",
  "edge_region": "local-edge-1",
  "expires_at": "2026-03-11T16:00:00.000Z",
  "payload_size_bytes": 185,
  "checksum_sha256": "a1b2c3..."
}
```

### Pull payload

```
GET /v1/payloads/:trex_id
Authorization: Bearer <token>
```

**Success (200 OK):** JSON with `trex_id`, `tzp_version`, `payload`, `metadata`, `checksum_sha256`. Returns 404 if TrexID is missing or expired, 403 if caller is not in `allowed_receivers`.

### Error format

```json
{
  "error": {
    "code": "TREX_NOT_FOUND",
    "message": "The requested TrexID does not exist or has expired.",
    "status": 404
  }
}
```

**Error codes:**

| Code                      | HTTP | When                                |
| :------------------------ | :--- | :---------------------------------- |
| `TREX_UNAUTHORIZED`       | 401  | Missing or invalid auth              |
| `TREX_FORBIDDEN`          | 403  | Caller not in allowed_receivers      |
| `TREX_NOT_FOUND`          | 404  | TrexID missing or expired           |
| `TREX_BAD_REQUEST`        | 400  | Invalid body or missing fields      |
| `TREX_VERSION_UNSUPPORTED`| 400  | Unsupported tzp_version              |
| `TREX_INTERNAL_ERROR`     | 500  | Server error                         |

### Example requests

**Push:**

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
      "source_lang": "en"
    },
    "metadata": { "sender_agent_id": "test_agent_1" }
  }'
```

**Pull:**

```bash
curl http://localhost:3000/v1/payloads/tx_aBcDeFgHiJk \
  -H "Authorization: Bearer testkey"
```

**Health:**

```bash
curl http://localhost:3000/health
# TrexAPI is healthy
```

---

## Authentication

All `/v1/payloads` endpoints use `authMiddleware`. Two modes:

### Mode A: Dev static key

When `DEV_API_KEY` is set in `.env`, use that value as the Bearer token:

```
Authorization: Bearer testkey
```

Caller `agent_id` is treated as `agent_dev_01`.

> **Dev only.** Remove `DEV_API_KEY` in production.

### Mode B: HMAC signature

Production: use keys in `api_keys` and sign with the secret.

```
Authorization: Bearer <key_id>:<hmac_signature>
```

Signature: `HMAC-SHA256(secret, key_id)` (hex).

**Register a key:**

```bash
sqlite3 trexapi_v1.db
```

```sql
INSERT INTO api_keys (key_id, secret, agent_id)
VALUES ('mykey01', 'a_strong_random_secret_at_least_32_bytes', 'agent_gpt4_research_01');
```

**Sign with OpenSSL:**

```bash
echo -n "mykey01" | openssl dgst -sha256 -hmac "a_strong_random_secret_at_least_32_bytes"
curl http://localhost:3000/v1/payloads/tx_xxx -H "Authorization: Bearer mykey01:<hex_output>"
```

**Node.js:**

```javascript
import crypto from 'crypto';
const sig = crypto.createHmac('sha256', secret).update('mykey01').digest('hex');
console.log(`mykey01:${sig}`);
```

---

## Docker deployment

No Dockerfile is committed. Use the following as a template.

### Dockerfile

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

### Build and run

```bash
docker build -t trexapi:latest .
docker run -d --name trexapi -p 3000:3000 -e TZP_REGION=asia-east1 -v trexapi-data:/app trexapi:latest
# or
docker compose up -d
```

> SQLite file is created in `/app`. Use a volume so data survives container recreation.

---

## Production deployment

### Reverse proxy

Put Nginx or Caddy in front for TLS and rate limiting.

**Nginx example:**

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
        client_max_body_size 1m;
    }
}
```

### Process manager (PM2)

```bash
npm install -g pm2
pm2 start dist/index.js --name trexapi
pm2 status
pm2 logs trexapi
pm2 startup && pm2 save
```

### Security checklist

| Item              | Action                                                |
| :---------------- | :---------------------------------------------------- |
| Disable dev key   | Remove `DEV_API_KEY` from `.env`                      |
| HTTPS only        | TLS 1.3 via reverse proxy, no plain HTTP              |
| Limit body size   | e.g. Nginx `client_max_body_size 1m`                  |
| DB permissions    | `chmod 600 trexapi_v1.db`                             |
| Expired payloads  | Cron to delete expired rows                           |
| Logging           | Keep access/audit logs (e.g. ≥ 90 days)               |

### Expired payload cleanup

The app does not delete expired rows automatically. Add a cron job:

```cron
0 * * * * sqlite3 /path/to/trexapi_v1.db "DELETE FROM payloads WHERE expires_at < datetime('now');"
```

---

## Troubleshooting

### Startup

| Symptom                                       | Cause                     | Fix                                           |
| :-------------------------------------------- | :------------------------ | :-------------------------------------------- |
| `Cannot find module './routes/payloads.js'`   | TS not built              | Run `npm run build` then start                |
| `Could not locate the bindings file`         | better-sqlite3 build fail | Install build tools, run `npm rebuild`       |
| `EADDRINUSE: address already in use`          | Port in use               | Change `PORT` in `.env` or kill process       |
| No "Server is running" after DB init         | Bad PORT                  | Ensure `PORT` is a valid number               |

### Requests

| Symptom                    | Cause                    | Fix                                                |
| :------------------------- | :----------------------- | :------------------------------------------------- |
| 401 `TREX_UNAUTHORIZED`    | Wrong/missing auth       | Check `Authorization: Bearer <token>` / DEV_API_KEY|
| 400 `TREX_BAD_REQUEST`     | Invalid JSON/schema      | Check required fields                              |
| 400 `TREX_VERSION_UNSUPPORTED` | Wrong tzp_version   | Use `"1.0"`                                        |
| 404 `TREX_NOT_FOUND`       | Bad or expired TrexID    | Verify ID and TTL                                  |
| 500 `TREX_INTERNAL_ERROR`  | DB or disk error         | Check logs, disk, DB permissions                   |

### Database

```bash
sqlite3 trexapi_v1.db
.tables
SELECT trex_id, expires_at FROM payloads;
SELECT * FROM api_keys;
DELETE FROM payloads WHERE expires_at < datetime('now');
```

---

## Known limitations and spec gaps

This implementation is **TZP-Core** level. Gaps vs TZP v1.0:

| Spec item                    | Current status                                           |
| :--------------------------- | :------------------------------------------------------- |
| TrexID with region (15 chars)| Uses 14 chars (`tx_` + 11 Base62), no region code        |
| DELETE revoke API            | Not implemented                                          |
| Per-chunk quant_params       | Single global object only                                |
| tzp_version SemVer           | Uses `"1.0"` not `"1.0.0"`                               |
| HMAC full message            | Simplified to HMAC(secret, key_id), no timestamp/path    |
| Nonce replay check           | Not implemented                                          |
| AES-256-GCM at rest          | Payloads stored as plain JSON in SQLite                  |
| E2EE                         | Not implemented                                          |
| Rate limiting                | Not implemented (use proxy or app layer)                 |
| allowed_receivers            | Implemented on pull                                      |
| Expired payload cleanup      | Checked on pull only, no background delete                |
| preferred_region             | Not implemented                                          |
| Audit logs (≥ 90 days)       | Not implemented (use proxy logs)                        |

These trade-offs keep the reference implementation simple for local deployment. Production deployments should align with the full spec where required.
