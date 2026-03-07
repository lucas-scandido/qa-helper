import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { listProductsHandler, createProductHandler, updateProductHandler } from '../controllers/product.controller'
import { productSchema, updateProductSchema } from '../schemas/product.schema'
import type { ProductInput } from '../schemas/product.schema'

export async function productRoutes(app: FastifyInstance) {

    // GET /api/products — lista todos os produtos cadastrados
    app.get('/', async (_req: FastifyRequest, reply: FastifyReply) => {
        return listProductsHandler(reply)
    })

    // POST /api/products — cadastra novo produto
    app.post<{ Body: ProductInput }>('/', async (
        req: FastifyRequest<{ Body: ProductInput }>,
        reply: FastifyReply
    ) => {
        const parsed = productSchema.safeParse(req.body)
        if (!parsed.success) {
            return reply.status(400).send({
                success: false,
                error: parsed.error.errors.map(e => e.message).join(', '),
            })
        }
        return createProductHandler(parsed.data, reply)
    })

    // PUT /api/products/:nome — atualiza produto existente
    app.put<{ Params: { nome: string }; Body: ProductInput }>('/:nome', async (
        req: FastifyRequest<{ Params: { nome: string }; Body: ProductInput }>,
        reply: FastifyReply
    ) => {
        const nome = decodeURIComponent(req.params.nome)
        const parsed = updateProductSchema.safeParse(req.body)
        if (!parsed.success) {
            return reply.status(400).send({
                success: false,
                error: parsed.error.errors.map(e => e.message).join(', '),
            })
        }
        return updateProductHandler(nome, parsed.data, reply)
    })
}
