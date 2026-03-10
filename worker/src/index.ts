import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { payloadRoutes } from './routes/payloads.js';
import { DEMO_HTML } from './demo.html.js';
import type { Bindings, Variables } from './types.js';

type AppEnv = { Bindings: Bindings; Variables: Variables };

const app = new Hono<AppEnv>();

app.use('*', cors());

app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({
    error: { code: 'TREX_INTERNAL_ERROR', message: 'An unexpected error occurred.', status: 500 }
  }, 500);
});

app.route('/v1/payloads', payloadRoutes);

app.get('/health', (c) => c.text('TrexAPI is healthy'));

app.get('/', (c) => c.html(DEMO_HTML));
app.get('/demo', (c) => c.redirect('/'));

export default app;
