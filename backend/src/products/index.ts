import fs from 'node:fs'
import path from 'node:path'
import asmob from './asmob.json'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface Product {
    nome: string
    tipo?: string
    ambiente: string[]
    usuarios: string[]
    modulos: Record<string, { descricao: string; ambiente: string }>
    areaPaths: string[]
}

// ─── Persistência ─────────────────────────────────────────────────────────────

const REGISTRY_PATH = path.join(process.cwd(), 'data', 'products-registry.json')

// ─── Registro em memória ──────────────────────────────────────────────────────

const products: Record<string, Product> = {
    asmob: asmob as Product,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toKey(nome: string): string {
    return nome.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
}

/**
 * Remove o último segmento do areaPath (geralmente sprint/iteração)
 * Ex: "Raia\Cora\Sprint 24" → "Raia\Cora"
 */
export function extractProductAreaPath(areaPath: string): string {
    const separator = areaPath.includes('\\') ? '\\' : '/'
    const parts = areaPath.split(separator).filter(Boolean)
    if (parts.length > 1) {
        return parts.slice(0, -1).join(separator)
    }
    return areaPath
}

function ensureDataDir(): void {
    const dir = path.dirname(REGISTRY_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function loadRegistry(): void {
    if (!fs.existsSync(REGISTRY_PATH)) return
    try {
        const raw = fs.readFileSync(REGISTRY_PATH, 'utf-8')
        const registry: Record<string, Product> = JSON.parse(raw)
        Object.assign(products, registry)
    } catch {
        // registry malformed — mantém defaults
    }
}

function saveRegistry(): void {
    ensureDataDir()
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(products, null, 2), 'utf-8')
}

loadRegistry()

// ─── Operações ────────────────────────────────────────────────────────────────

export function registerProduct(product: Product): void {
    const key = toKey(product.nome)
    products[key] = product
    saveRegistry()
}

export function updateProduct(nome: string, updated: Product): void {
    const key = toKey(nome)
    if (!products[key]) throw new Error(`Produto "${nome}" não encontrado`)
    products[key] = updated
    saveRegistry()
}

export function listProducts(): Product[] {
    return Object.values(products)
}

export function getProductByNome(nome: string): Product | null {
    return products[toKey(nome)] ?? null
}

// ─── Identifica produto pelo Area Path ───────────────────────────────────────

export function identifyProductByAreaPath(areaPath: string): Product | null {
    const ap = areaPath.toLowerCase()
    for (const product of Object.values(products)) {
        const matched = product.areaPaths.some(p => {
            const stored = p.toLowerCase()
            return ap.startsWith(stored) || ap.includes(stored)
        })
        if (matched) return product
    }
    return null
}

// ─── Monta texto de contexto para o prompt ───────────────────────────────────

export function buildProductContext(product: Product): string {
    const modulosText = Object.entries(product.modulos)
        .map(([modulo, { descricao, ambiente }]) => `  - ${modulo} (${ambiente}): ${descricao}`)
        .join('\n')

    return `
Produto: ${product.nome}${product.tipo ? `\nTipo: ${product.tipo}` : ''}
Ambiente: ${product.ambiente.join(', ')}
Usuários: ${product.usuarios.join(', ')}

Módulos:
${modulosText || '  (não informado)'}
`.trim()
}
