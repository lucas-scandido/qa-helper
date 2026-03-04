import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { searchItem, generateBug, createBugHandler } from '../controllers/bug.controller'
import { generateBugSchema, createBugSchema } from '../schemas/bug.schema'
import type { GenerateBugInput, CreateBugInput } from '../schemas/bug.schema'

export async function bugRoutes(app: FastifyInstance) {

  // GET /api/bugs/search/:id — busca work item por ID
  // Params sempre chegam como string no Fastify, convertemos no controller
  app.get<{ Params: { id: string } }>('/search/:id', async (
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return reply.status(400).send({
        success: false,
        error: 'ID deve ser um número inteiro maior que zero',
      })
    }

    return searchItem(id, reply)
  })

  // POST /api/bugs/generate — gera bug com IA
  app.post<{ Body: GenerateBugInput }>('/generate', async (
    req: FastifyRequest<{ Body: GenerateBugInput }>,
    reply: FastifyReply
  ) => {
    const parsed = generateBugSchema.safeParse(req.body)

    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: parsed.error.errors.map(e => e.message).join(', '),
      })
    }

    return generateBug(parsed.data, reply)
  })

  // POST /api/bugs/create — cria bug no Azure DevOps
  app.post<{ Body: CreateBugInput }>('/create', async (
    req: FastifyRequest<{ Body: CreateBugInput }>,
    reply: FastifyReply
  ) => {
    const parsed = createBugSchema.safeParse(req.body)

    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: parsed.error.errors.map(e => e.message).join(', '),
      })
    }

    return createBugHandler(parsed.data, reply)
  })
}