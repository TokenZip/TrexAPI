import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import crypto from 'crypto'
import { db } from '../db/index.js'
import { generateTrexID } from '../utils/trexId.js'
import { authMiddleware } from '../utils/crypto.js'

type Variables = {
    agent_id: string
}

interface PayloadRecord {
    trex_id: string
    payload: string
    metadata: string
    checksum_sha256: string
    expires_at: string
    created_at: string
}

export const payloadRoutes = new Hono<{ Variables: Variables }>()

// Apply Auth Middleware to all payload routes
payloadRoutes.use('*', authMiddleware)

// Payload Schema Definitions based on TZP Spec
const tzpPayloadSchema = z.object({
    vector_seq_b64: z.array(z.string()),
    quant_params: z.object({
        min: z.number(),
        max: z.number(),
        method: z.string()
    }),
    dimensions: z.number().int().positive(),
    chunk_count: z.number().int().positive(),
    summary: z.string().optional(),
    source_lang: z.string().optional(),
})

const tzpMetadataSchema = z.object({
    sender_agent_id: z.string().optional(),
    allowed_receivers: z.array(z.string()).optional(),
    ttl_seconds: z.number().int().positive().optional().default(86400),
    created_at: z.string().datetime().optional(),
    idempotency_key: z.string().optional()
})

const pushRequestSchema = z.object({
    tzp_version: z.string(),
    payload: tzpPayloadSchema,
    metadata: tzpMetadataSchema.optional()
})

payloadRoutes.post(
    '/',
    zValidator('json', pushRequestSchema, (result: any, c: any) => {
        if (!result.success) {
            return c.json({
                error: {
                    code: 'TREX_BAD_REQUEST',
                    message: 'Invalid payload format or missing required fields',
                    status: 400
                }
            }, 400)
        }
    }),
    async (c) => {
        try {
            const data = c.req.valid('json')

            // Enforce Protocol Version
            if (data.tzp_version !== '1.0') {
                return c.json({
                    error: {
                        code: 'TREX_VERSION_UNSUPPORTED',
                        message: 'Unsupported TZP version. Server supports: 1.0',
                        status: 400
                    }
                }, 400)
            }

            const trexId = generateTrexID()

            const createdAtStr = data.metadata?.created_at || new Date().toISOString()
            const createdAt = new Date(createdAtStr)

            const ttlSeconds = data.metadata?.ttl_seconds ?? 86400 // default 24h
            const expiresAt = new Date(createdAt.getTime() + ttlSeconds * 1000)

            // Serialize payload to string to calculate hash and size
            const payloadStr = JSON.stringify(data.payload)
            const payloadSizeBytes = Buffer.byteLength(payloadStr, 'utf8')
            const checksumSha256 = crypto.createHash('sha256').update(payloadStr).digest('hex')

            // Insert into SQLite
            try {
                db.prepare(`
          INSERT INTO payloads (trex_id, payload, metadata, checksum_sha256, expires_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
                    trexId,
                    JSON.stringify(data.payload),
                    JSON.stringify(data.metadata ?? {}),
                    checksumSha256,
                    expiresAt.toISOString(),
                    createdAt.toISOString()
                )
            } catch (dbError) {
                console.error('Database insert error:', dbError)
                return c.json({
                    error: {
                        code: 'TREX_INTERNAL_ERROR',
                        message: 'Database insert error',
                        status: 500
                    }
                }, 500)
            }

            // Return 201 Created format specified by TZP
            return c.json({
                trex_id: trexId,
                edge_region: process.env.TZP_REGION || 'local-1',
                expires_at: expiresAt.toISOString(),
                payload_size_bytes: payloadSizeBytes,
                checksum_sha256: checksumSha256
            }, 201)

        } catch (error) {
            console.error('Push payload error:', error)
            return c.json({
                error: {
                    code: 'TREX_INTERNAL_ERROR',
                    message: 'Internal server error while processing push request',
                    status: 500
                }
            }, 500)
        }
    })

payloadRoutes.get('/:trex_id', async (c) => {
    const trexId = c.req.param('trex_id')

    try {
        const record = db.prepare('SELECT * FROM payloads WHERE trex_id = ?').get(trexId) as PayloadRecord | undefined

        if (!record) {
            return c.json({
                error: {
                    code: 'TREX_NOT_FOUND',
                    message: 'The requested TrexID does not exist or has expired.',
                    status: 404
                }
            }, 404)
        }

        // Check expiration
        if (new Date() > new Date(record.expires_at)) {
            return c.json({
                error: {
                    code: 'TREX_NOT_FOUND',
                    message: 'The requested TrexID has expired.',
                    status: 404
                }
            }, 404)
        }

        let payload: unknown
        let metadata: Record<string, unknown>
        try {
            payload = JSON.parse(record.payload)
            metadata = JSON.parse(record.metadata)
        } catch {
            return c.json({
                error: {
                    code: 'TREX_INTERNAL_ERROR',
                    message: 'Stored data is corrupted.',
                    status: 500
                }
            }, 500)
        }

        const agentId = c.get('agent_id')
        const allowedReceivers = Array.isArray(metadata.allowed_receivers)
            ? metadata.allowed_receivers as string[]
            : undefined

        if (allowedReceivers && allowedReceivers.length > 0) {
            if (!agentId || !allowedReceivers.includes(agentId)) {
                return c.json({
                    error: {
                        code: 'TREX_FORBIDDEN',
                        message: 'Current Agent not in allowed_receivers list.',
                        status: 403
                    }
                }, 403)
            }
        }

        return c.json({
            trex_id: record.trex_id,
            tzp_version: "1.0",
            payload,
            metadata,
            checksum_sha256: record.checksum_sha256
        }, 200)

    } catch (error) {
        console.error('Pull payload error:', error)
        return c.json({
            error: {
                code: 'TREX_INTERNAL_ERROR',
                message: 'Internal server error while retrieving payload',
                status: 500
            }
        }, 500)
    }
})
