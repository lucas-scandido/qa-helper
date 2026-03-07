import Fastify, { type FastifyError } from 'fastify'
import cors from '@fastify/cors'
import { env } from './config/env'
import { bugRoutes } from './routes/bug.routes'
import { productRoutes } from './routes/product.routes'

async function start() {
  const app = Fastify({
    logger: {
      level: 'info',
      transport: { target: 'pino-pretty' },
    },
  })

  // ─── CORS ───────────────────────────────────────────────────────────────────
  await app.register(cors, {
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  })

  // ─── Error handler ──────────────────────────────────────────────────────────
  app.setErrorHandler((error: FastifyError, _req, reply) => {
    reply.status(error.statusCode ?? 500).send({
      success: false,
      error: error.message ?? 'Erro interno do servidor',
    })
  })

  // ─── Rotas ──────────────────────────────────────────────────────────────────
  await app.register(bugRoutes, { prefix: '/api/bugs' })
  await app.register(productRoutes, { prefix: '/api/products' })

  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    model: env.ANTHROPIC_MODEL,
  }))

  // ─── Start ──────────────────────────────────────────────────────────────────
  try {
    await app.listen({ port: Number(env.PORT), host: '0.0.0.0' })
    console.log(`\n🚀 Servidor rodando em http://localhost:${env.PORT}`)
    console.log(`🤖 Modelo: ${env.ANTHROPIC_MODEL}`)
    console.log(`🔗 Azure: ${env.AZURE_ORGANIZATION}/${env.AZURE_PROJECT}\n`)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error(`❌ ${message}`)
    process.exit(1)
  }
}

start()
