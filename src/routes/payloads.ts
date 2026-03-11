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
    ttl_seconds: z.number().int().min(60).max(604800).optional().default(86400),
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

            // Enforce Protocol Version (exact valid semantics)
            if (data.tzp_version !== '1.0' && data.tzp_version !== '1.0.0') {
                return c.json({
                    error: {
                        code: 'TREX_VERSION_UNSUPPORTED',
                        message: 'Unsupported TZP version. Server supports: 1.0.0',
                        status: 400
                    }
                }, 400)
            }

            const trexId = generateTrexID()

            const createdAtStr = data.metadata?.created_at || new Date().toISOString()
            const createdAt = new Date(createdAtStr)

            const ttlSeconds = data.metadata?.ttl_seconds ?? 86400 // default 24h
            const expiresAt = new Date(createdAt.getTime() + ttlSeconds * 1000)

            // Ensure the sender_agent_id from the metadata exists or default to the auth agent
            const agentId = c.get('agent_id') as string | undefined
            const finalMetadata = {
                ...data.metadata,
                sender_agent_id: data.metadata?.sender_agent_id || agentId
            }

            // Serialize payload to string to calculate hash and size
            const payloadStr = JSON.stringify(data.payload)
            const payloadSizeBytes = Buffer.byteLength(payloadStr, 'utf8')
            
            // Per TZP spec 5.2.1, checksum is SHA-256 over exactly the concatenated vector sequences
            const seqConcat = data.payload.vector_seq_b64.join('')
            const checksumSha256 = crypto.createHash('sha256').update(seqConcat).digest('hex')

            // Insert into SQLite
            try {
                db.prepare(`
          INSERT INTO payloads (trex_id, payload, metadata, checksum_sha256, expires_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
                    trexId,
                    JSON.stringify(data.payload),
                    JSON.stringify(finalMetadata),
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
        const record = db.prepare('SELECT * FROM payloads WHERE trex_id = ?').get(trexId) as PayloadRecord & { status?: string } | undefined

        if (!record || record.status === 'REVOKED') {
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

payloadRoutes.on('HEAD', '/:trex_id', async (c) => {
    const trexId = c.req.param('trex_id')
    try {
        const record = db.prepare('SELECT * FROM payloads WHERE trex_id = ?').get(trexId) as PayloadRecord & { status?: string } | undefined

        // Not valid if not found or revoked
        if (!record || record.status === 'REVOKED') {
            return new Response(null, { status: 404 })
        }

        // Not valid if expired
        if (new Date() > new Date(record.expires_at)) {
            return new Response(null, { status: 404 })
        }

        // For real API, we check allowed_receivers here again. 
        try {
            const metadata = JSON.parse(record.metadata)
            const agentId = c.get('agent_id')
            const allowedReceivers = Array.isArray(metadata.allowed_receivers) ? metadata.allowed_receivers as string[] : undefined
            if (allowedReceivers && allowedReceivers.length > 0) {
                if (!agentId || !allowedReceivers.includes(agentId)) {
                    return new Response(null, { status: 403 })
                }
            }
        } catch { } // Ignore parse errors on HEAD, rely on core data

        const payloadStr = Buffer.byteLength(record.payload, 'utf8')
        
        let chunkCountStr = '0'
        try {
            const payloadParsed = JSON.parse(record.payload)
            if (payloadParsed.chunk_count) {
                chunkCountStr = payloadParsed.chunk_count.toString()
            }
        } catch {}

        c.header('X-TZP-Status', 'ACTIVE')
        c.header('X-TZP-Payload-Size', payloadStr.toString())
        c.header('X-TZP-Expires-At', record.expires_at)
        c.header('X-TZP-Chunk-Count', chunkCountStr)
        c.header('X-TZP-Checksum-SHA256', record.checksum_sha256)

        return new Response(null, { status: 200, headers: c.res.headers })
    } catch {
        return new Response(null, { status: 500 })
    }
})

payloadRoutes.delete('/:trex_id', async (c) => {
    const trexId = c.req.param('trex_id')
    try {
        const record = db.prepare('SELECT * FROM payloads WHERE trex_id = ?').get(trexId) as PayloadRecord & { status?: string } | undefined

        if (!record) {
            return c.json({ error: { code: 'TREX_NOT_FOUND', message: 'Not found', status: 404 } }, 404)
        }

        if (record.status === 'REVOKED') {
            return c.json({ error: { code: 'TREX_NOT_FOUND', message: 'Already revoked or does not exist', status: 404 } }, 404)
        }

        const agentId = c.get('agent_id')
        let metadata: Record<string, unknown> = {}
        try {
            metadata = JSON.parse(record.metadata)
        } catch {}

        if (metadata.sender_agent_id !== agentId) {
            return c.json({ error: { code: 'TREX_FORBIDDEN', message: 'Agent ID does not match sender', status: 403 } }, 403)
        }

        const revokedAt = new Date().toISOString()
        db.prepare('UPDATE payloads SET status = ?, revoked_at = ? WHERE trex_id = ?').run('REVOKED', revokedAt, trexId)

        return c.json({
            trex_id: trexId,
            status: 'REVOKED',
            revoked_at: revokedAt
        }, 200)

    } catch (error) {
        return c.json({
            error: {
                code: 'TREX_INTERNAL_ERROR',
                message: 'Internal server error while revoking payload',
                status: 500
            }
        }, 500)
    }
})
