import asmob from './asmob.json'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface Product {
    nome: string
    tipo: string
    plataformas: string[]
    usuarios: string[]
    fluxos: Record<string, string[]>
    modulos: Record<string, string>
    areaPaths: string[]
}

// ─── Adaptador para JSONs legados (ambiente → plataformas) ───────────────────

interface LegacyProduct {
    nome: string
    tipo: string
    ambiente: string[]
    usuarios: string[]
    fluxos: Record<string, string[]>
    modulos: Record<string, string>
    areaPaths: string[]
}

function adaptLegacyProduct(legacy: LegacyProduct): Product {
    return {
        nome: legacy.nome,
        tipo: legacy.tipo,
        plataformas: legacy.ambiente,
        usuarios: legacy.usuarios,
        fluxos: legacy.fluxos,
        modulos: legacy.modulos,
        areaPaths: legacy.areaPaths,
    }
}

// ─── Registro de produtos (seed + dinâmicos) ─────────────────────────────────

const products: Record<string, Product> = {
    asmob: adaptLegacyProduct(asmob as LegacyProduct),
}

// ─── Registrar produto em runtime ────────────────────────────────────────────

export function registerProduct(product: Product): void {
    const key = product.nome.toLowerCase().replace(/\s+/g, '-')
    products[key] = product
}

// ─── Listar todos os produtos registrados ────────────────────────────────────

export function getAllProducts(): Product[] {
    return Object.values(products)
}

// ─── Identifica produto pelo Area Path ───────────────────────────────────────

export function identifyProductByAreaPath(areaPath: string): Product | null {
    const ap = areaPath.toLowerCase()

    for (const product of Object.values(products)) {
        const matched = product.areaPaths.some(path => ap.includes(path))
        if (matched) return product
    }

    return null
}

// ─── Monta texto de contexto para o prompt ───────────────────────────────────

export function buildProductContext(product: Product): string {
    const fluxosText = Object.entries(product.fluxos)
        .map(([fluxo, modulos]) =>
            `  - ${fluxo}:\n${modulos.map(m => `    - ${m}`).join('\n')}`)
        .join('\n')

    const modulosText = Object.entries(product.modulos)
        .map(([modulo, descricao]) => `  - ${modulo}: ${descricao}`)
        .join('\n')

    return `
Produto: ${product.nome}
Tipo: ${product.tipo}
Plataformas: ${product.plataformas.join(', ')}
Usuários: ${product.usuarios.join(', ')}

Fluxos:
${fluxosText}

Módulos:
${modulosText}
`.trim()
}