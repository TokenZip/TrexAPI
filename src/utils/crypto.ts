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

    // The actual HMAC verification logic would go here
    // For standard TZP, the exact HMAC signing string to verify isn't strictly defined,
    // but let's mock the process:
    // e.g., token format: Bearer <key_id>:<hmac_signature>
    const token = authHeader.replace(/^Bearer\s+/, '').replace(/^hmac\s+/, '')
    const [keyId, signature] = token.split(':')

    if (!keyId || !signature) {
        // If not in `<id>:<sig>` format, we will just pass it to mock validation
        // In a real scenario, you'd fail here. For easy development/testing, we might allow a direct key.

        // Check if the token strictly equals a dev api key
        if (token === process.env.DEV_API_KEY) {
            c.set('agent_id', 'agent_dev_01')
            await next()
            return
        }

        return c.json({
            error: {
                code: 'TREX_UNAUTHORIZED',
                message: 'Invalid signature format. Expected Bearer <keyId>:<signature> or valid DEV matching token.',
                status: 401
            }
        }, 401)
    }

    try {
        const row = db.prepare('SELECT secret, agent_id FROM api_keys WHERE key_id = ?').get(keyId) as { secret: string, agent_id: string } | undefined

        if (!row) {
            return c.json({
                error: { code: 'TREX_UNAUTHORIZED', message: 'API Key not found.', status: 401 }
            }, 401)
        }

        const { secret, agent_id } = row

        // Construct the payload to check the signature against. 
        // Usually it's the raw body or timestamp + uri.
        // For this reference API, we will just hash the key_id with the secret to keep it simple.
        const expectedSignature = crypto.createHmac('sha256', secret).update(keyId).digest('hex')

        const expectedBuf = Buffer.from(expectedSignature)
        const signatureBuf = Buffer.from(signature)

        if (expectedBuf.length !== signatureBuf.length ||
            !crypto.timingSafeEqual(expectedBuf, signatureBuf)) {
            return c.json({
                error: { code: 'TREX_UNAUTHORIZED', message: 'Invalid HMAC signature.', status: 401 }
            }, 401)
        }

        c.set('agent_id', agent_id)
        await next()

    } catch (error) {
        console.error('Auth verification error:', error)
        return c.json({
            error: { code: 'TREX_INTERNAL_ERROR', message: 'Internal Server Error during auth', status: 500 }
        }, 500)
    }
}
