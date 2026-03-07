import type { FastifyReply } from 'fastify'
import { registerProduct, updateProduct, listProducts, getProductByNome, extractProductAreaPath } from '../products'
import type { Product } from '../products'
import type { ProductInput } from '../schemas/product.schema'

function buildProduct(input: ProductInput, existingAreaPaths?: string[]): Product {
    const derivedPath = extractProductAreaPath(input.areaPath)
    const areaPaths = existingAreaPaths
        ? Array.from(new Set([...existingAreaPaths, derivedPath]))
        : [derivedPath]

    return {
        nome: input.nome,
        ambiente: input.ambiente,
        usuarios: input.usuarios,
        modulos: input.modulos,
        areaPaths,
    }
}

// ─── GET /api/products ────────────────────────────────────────────────────────

export async function listProductsHandler(reply: FastifyReply) {
    return reply.send({ success: true, data: listProducts() })
}

// ─── POST /api/products ───────────────────────────────────────────────────────

export async function createProductHandler(input: ProductInput, reply: FastifyReply) {
    const product = buildProduct(input)
    registerProduct(product)
    return reply.status(201).send({ success: true, data: product })
}

// ─── PUT /api/products/:nome ──────────────────────────────────────────────────

export async function updateProductHandler(nome: string, input: ProductInput, reply: FastifyReply) {
    try {
        const existing = getProductByNome(nome)
        const product = buildProduct(input, existing?.areaPaths)
        updateProduct(nome, product)
        return reply.send({ success: true, data: product })
    } catch (err) {
        return reply.status(404).send({
            success: false,
            error: err instanceof Error ? err.message : 'Produto não encontrado',
        })
    }
}
