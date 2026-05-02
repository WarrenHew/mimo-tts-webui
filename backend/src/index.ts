import 'dotenv/config'; // fallback for non --env-file starts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { ttsRoutes } from './routes/tts.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // CORS: allow frontend dev server
  await app.register(cors, {
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Register routes
  await app.register(ttsRoutes);

  // Start server
  try {
    await app.listen({ port: PORT, host: HOST });
    const hasKey = !!process.env.MIMO_API_KEY;
    const keyPreview = hasKey
      ? process.env.MIMO_API_KEY!.slice(0, 8) + '...'
      : '<not set>';
    app.log.info(`MiMo TTS Backend → http://${HOST}:${PORT}`);
    app.log.info(`MIMO_API_KEY: ${keyPreview}`);
    app.log.info(`MIMO_BASE_URL: ${process.env.MIMO_BASE_URL || 'https://api.xiaomimimo.com'}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
