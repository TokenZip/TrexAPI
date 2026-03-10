import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { bodyLimit } from 'hono/body-limit'
import { serve } from '@hono/node-server'
import { payloadRoutes } from './routes/payloads.js'
import { initDb } from './db/index.js'
import * as dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

initDb()

const app = new Hono()

app.use('*', logger())
app.use('*', cors())
app.use('/v1/payloads/*', bodyLimit({ maxSize: 1024 * 1024 }))

app.onError((err, c) => {
    console.error('Unhandled error:', err)
    return c.json({
        error: {
            code: 'TREX_INTERNAL_ERROR',
            message: 'An unexpected error occurred.',
            status: 500
        }
    }, 500)
})

app.route('/v1/payloads', payloadRoutes)

app.get('/health', (c) => {
    return c.text('TrexAPI is healthy')
})

const serveDemoHtml = (c: any) => {
    const htmlPath = path.resolve(process.cwd(), 'public', 'demo.html')
    try {
        const html = fs.readFileSync(htmlPath, 'utf-8')
        return c.html(html)
    } catch {
        return c.text('Page not found. Ensure public/demo.html exists.', 404)
    }
}

app.get('/', serveDemoHtml)
app.get('/demo', serveDemoHtml)

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
console.log(`Server is running on port ${port}`)

serve({
    fetch: app.fetch,
    port
})
