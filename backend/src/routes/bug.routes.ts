import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { searchItem, generateBug, createBugHandler, getBugStatsHandler } from '../controllers/bug.controller'
import { generateBugSchema, createBugSchema, productSchema } from '../schemas/bug.schema'
import type { GenerateBugInput, CreateBugInput } from '../schemas/bug.schema'
import { identifyProductByAreaPath, registerProduct } from '../products'
import type { Product } from '../products'

export async function bugRoutes(app: FastifyInstance) {

    // GET /api/bugs/stats — total de bugs criados por IA nos últimos 90 dias
    app.get('/stats', async (_req: FastifyRequest, reply: FastifyReply) => {
        return getBugStatsHandler(reply)
    })

    // GET /api/bugs/search/:id — busca work item por ID
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

    // ─── Rotas de Produto ─────────────────────────────────────────────────────

    // GET /api/bugs/products/check/:areaPath — verifica se existe produto para o Area Path
    app.get<{ Params: { areaPath: string } }>('/products/check/:areaPath', async (
        req: FastifyRequest<{ Params: { areaPath: string } }>,
        reply: FastifyReply
    ) => {
        const areaPath = decodeURIComponent(req.params.areaPath)
        const product = identifyProductByAreaPath(areaPath)

        if (product) {
            return reply.send({ success: true, exists: true, data: product })
        }

        return reply.send({ success: true, exists: false })
    })

    // POST /api/bugs/products — cadastra novo produto
    app.post<{ Body: Product }>('/products', async (
        req: FastifyRequest<{ Body: Product }>,
        reply: FastifyReply
    ) => {
        const parsed = productSchema.safeParse(req.body)

        if (!parsed.success) {
            return reply.status(400).send({
                success: false,
                error: parsed.error.errors.map(e => e.message).join(', '),
            })
        }

        registerProduct(parsed.data as Product)

        return reply.status(201).send({ success: true, data: parsed.data })
    })
}