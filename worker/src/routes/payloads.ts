import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { generateTrexID } from '../utils/trexId.js';
import { sha256Hex, hmacSha256Hex, timingSafeEqual } from '../utils/crypto.js';
import type { AppEnv, PayloadRecord } from '../types.js';

export const payloadRoutes = new Hono<AppEnv>();

/* ── Auth Middleware ── */
payloadRoutes.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || (!authHeader.startsWith('Bearer ') && !authHeader.startsWith('hmac '))) {
    return c.json({ error: { code: 'TREX_UNAUTHORIZED', message: 'Signature token invalid or missing.', status: 401 } }, 401);
  }

  const token = authHeader.replace(/^Bearer\s+/, '').replace(/^hmac\s+/, '');
  const [keyId, signature] = token.split(':');

  if (!keyId || !signature) {
    if (token === c.env.DEV_API_KEY) {
      c.set('agent_id', 'agent_dev_01');
      await next();
      return;
    }
    return c.json({ error: { code: 'TREX_UNAUTHORIZED', message: 'Invalid token format.', status: 401 } }, 401);
  }

  const row = await c.env.DB.prepare('SELECT secret, agent_id FROM api_keys WHERE key_id = ?').bind(keyId).first<{ secret: string; agent_id: string }>();
  if (!row) {
    return c.json({ error: { code: 'TREX_UNAUTHORIZED', message: 'API Key not found.', status: 401 } }, 401);
  }

  const expected = await hmacSha256Hex(row.secret, keyId);
  if (!timingSafeEqual(expected, signature)) {
    return c.json({ error: { code: 'TREX_UNAUTHORIZED', message: 'Invalid HMAC signature.', status: 401 } }, 401);
  }

  c.set('agent_id', row.agent_id);
  await next();
});

/* ── Schemas ── */
const tzpPayloadSchema = z.object({
  vector_seq_b64: z.array(z.string()),
  quant_params: z.object({ min: z.number(), max: z.number(), method: z.string() }),
  dimensions: z.number().int().positive(),
  chunk_count: z.number().int().positive(),
  fallback_text_zstd_b64: z.string().optional(),
  summary: z.string().optional(),
  source_lang: z.string().optional(),
});

const tzpMetadataSchema = z.object({
  sender_agent_id: z.string().optional(),
  allowed_receivers: z.array(z.string()).optional(),
  ttl_seconds: z.number().int().positive().optional().default(86400),
  created_at: z.string().datetime().optional(),
  idempotency_key: z.string().optional(),
});

const pushRequestSchema = z.object({
  tzp_version: z.string(),
  payload: tzpPayloadSchema,
  metadata: tzpMetadataSchema.optional(),
});

/* ── POST /  (Push) ── */
payloadRoutes.post(
  '/',
  zValidator('json', pushRequestSchema, (result: any, c: any) => {
    if (!result.success) {
      return c.json({ error: { code: 'TREX_BAD_REQUEST', message: 'Invalid payload format or missing required fields', status: 400 } }, 400);
    }
  }),
  async (c) => {
    try {
      const data = c.req.valid('json');

      if (data.tzp_version !== '1.0') {
        return c.json({ error: { code: 'TREX_VERSION_UNSUPPORTED', message: 'Unsupported TZP version. Server supports: 1.0', status: 400 } }, 400);
      }

      const trexId = generateTrexID(c.env.TZP_REGION);
      const createdAtStr = data.metadata?.created_at || new Date().toISOString();
      const createdAt = new Date(createdAtStr);
      const ttlSeconds = data.metadata?.ttl_seconds ?? 86400;
      const expiresAt = new Date(createdAt.getTime() + ttlSeconds * 1000);

      const payloadStr = JSON.stringify(data.payload);
      const payloadSizeBytes = new TextEncoder().encode(payloadStr).byteLength;
      const checksumSha256 = await sha256Hex(payloadStr);

      await c.env.DB.prepare(
        'INSERT INTO payloads (trex_id, payload, metadata, checksum_sha256, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(
        trexId,
        payloadStr,
        JSON.stringify(data.metadata ?? {}),
        checksumSha256,
        expiresAt.toISOString(),
        createdAt.toISOString()
      ).run();

      return c.json({
        trex_id: trexId,
        edge_region: c.env.TZP_REGION || 'local-1',
        expires_at: expiresAt.toISOString(),
        payload_size_bytes: payloadSizeBytes,
        checksum_sha256: checksumSha256,
      }, 201);
    } catch (error) {
      console.error('Push payload error:', error);
      return c.json({ error: { code: 'TREX_INTERNAL_ERROR', message: 'Internal server error while processing push request', status: 500 } }, 500);
    }
  }
);

/* ── GET /:trex_id  (Pull) ── */
payloadRoutes.get('/:trex_id', async (c) => {
  const trexId = c.req.param('trex_id');

  try {
    const record = await c.env.DB.prepare('SELECT * FROM payloads WHERE trex_id = ?').bind(trexId).first<PayloadRecord>();

    if (!record) {
      return c.json({ error: { code: 'TREX_NOT_FOUND', message: 'The requested TrexID does not exist or has expired.', status: 404 } }, 404);
    }

    if (new Date() > new Date(record.expires_at)) {
      return c.json({ error: { code: 'TREX_NOT_FOUND', message: 'The requested TrexID has expired.', status: 404 } }, 404);
    }

    let payload: unknown;
    let metadata: Record<string, unknown>;
    try {
      payload = JSON.parse(record.payload);
      metadata = JSON.parse(record.metadata);
    } catch {
      return c.json({ error: { code: 'TREX_INTERNAL_ERROR', message: 'Stored data is corrupted.', status: 500 } }, 500);
    }

    const agentId = c.get('agent_id');
    const allowedReceivers = Array.isArray(metadata.allowed_receivers) ? metadata.allowed_receivers as string[] : undefined;
    if (allowedReceivers && allowedReceivers.length > 0) {
      if (!agentId || !allowedReceivers.includes(agentId)) {
        return c.json({ error: { code: 'TREX_FORBIDDEN', message: 'Current Agent not in allowed_receivers list.', status: 403 } }, 403);
      }
    }

    return c.json({
      trex_id: record.trex_id,
      tzp_version: '1.0',
      payload,
      metadata,
      checksum_sha256: record.checksum_sha256,
    }, 200);
  } catch (error) {
    console.error('Pull payload error:', error);
    return c.json({ error: { code: 'TREX_INTERNAL_ERROR', message: 'Internal server error while retrieving payload', status: 500 } }, 500);
  }
});
