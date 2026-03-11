import type { Context, Next } from 'hono'
import crypto from 'crypto'
import { db } from '../db/index.js'

export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization')

    if (!authHeader || (!authHeader.startsWith('Bearer ') && !authHeader.startsWith('hmac '))) {
        return c.json({
            error: {
                code: 'TREX_UNAUTHORIZED',
                message: 'Signature token invalid or missing.',
                status: 401
            }
        }, 401)
    }

    const token = authHeader.replace(/^Bearer\s+/, '').replace(/^hmac\s+/, '')
    const parts = token.split(':')

    // Format: {agent_id}:{timestamp_iso8601}:{nonce}:{signature_base64url}
    if (parts.length !== 4) {
        if (token === process.env.DEV_API_KEY) {
            c.set('agent_id', 'agent_dev_01')
            await next()
            return
        }

        return c.json({
            error: {
                code: 'TREX_UNAUTHORIZED',
                message: 'Invalid signature format. Expected Bearer <agent_id>:<timestamp>:<nonce>:<signature>.',
                status: 401
            }
        }, 401)
    }

    const [agentId, timestampStr, nonce, signatureBase64url] = parts

    if (!agentId || !timestampStr || !nonce || !signatureBase64url) {
        return c.json({
            error: {
                code: 'TREX_UNAUTHORIZED',
                message: 'Invalid signature format. Missing expected parts.',
                status: 401
            }
        }, 401)
    }

    // Validate Timestamp (±5 minutes)
    const requestTime = new Date(timestampStr).getTime()
    const now = Date.now()
    if (isNaN(requestTime) || Math.abs(now - requestTime) > 5 * 60 * 1000) {
        return c.json({
            error: { code: 'TREX_UNAUTHORIZED', message: 'Request timestamp is invalid or expired (±5 minutes).', status: 401 }
        }, 401)
    }

    // Validate Nonce (10 min duplicate window)
    try {
        const stmt = db.prepare('SELECT nonce FROM nonces WHERE nonce = ?')
        const existingNonce = stmt.get(nonce)
        
        if (existingNonce) {
            return c.json({
                error: { code: 'TREX_UNAUTHORIZED', message: 'Nonce has already been used (Replay Attack Prevention).', status: 401 }
            }, 401)
        }

        // Clean up old nonces and insert new one
        db.prepare("DELETE FROM nonces WHERE expires_at < datetime('now')").run()
        const nonceExpiresAt = new Date(now + 10 * 60 * 1000).toISOString()
        db.prepare('INSERT INTO nonces (nonce, agent_id, expires_at) VALUES (?, ?, ?)').run(nonce, agentId, nonceExpiresAt)
    } catch (error) {
         console.error('Nonce validation error:', error)
         return c.json({
             error: { code: 'TREX_INTERNAL_ERROR', message: 'Internal Server Error during nonce verification', status: 500 }
         }, 500)
    }

    try {
        const row = db.prepare('SELECT secret FROM api_keys WHERE agent_id = ?').get(agentId) as { secret: string } | undefined

        // For this reference API, to make testing easy without populating api_keys, we can also fallback to DEV_API_KEY 
        // if agent_id starts with agent_dev
        let secret = row?.secret
        if (!secret && agentId.startsWith('agent_dev') && process.env.DEV_API_KEY) {
            secret = process.env.DEV_API_KEY
        }

        if (!secret) {
            return c.json({
                error: { code: 'TREX_UNAUTHORIZED', message: 'Agent ID or API Key not found.', status: 401 }
            }, 401)
        }

        // Construct canonical string
        const method = c.req.method
        // Hono req.path gives the path without query string, which is standard for signatures unless queries are included
        const path = new URL(c.req.url).pathname 
        
        const canonicalString = `${method}\n${path}\n${timestampStr}\n${nonce}`
        
        const expectedSignature = crypto.createHmac('sha256', secret).update(canonicalString).digest('base64url')

        const expectedBuf = Buffer.from(expectedSignature)
        const signatureBuf = Buffer.from(signatureBase64url)

        if (expectedBuf.length !== signatureBuf.length ||
            !crypto.timingSafeEqual(expectedBuf, signatureBuf)) {
            return c.json({
                error: { code: 'TREX_UNAUTHORIZED', message: 'Invalid HMAC signature.', status: 401 }
            }, 401)
        }

        c.set('agent_id', agentId)
        await next()

    } catch (error) {
        console.error('Auth verification error:', error)
        return c.json({
            error: { code: 'TREX_INTERNAL_ERROR', message: 'Internal Server Error during auth', status: 500 }
        }, 500)
    }
}
