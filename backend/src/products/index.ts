import asmob from './asmob.json'
import cora from './cora.json'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface Product {
    nome: string
    tipo: string
    ambiente: string[]
    usuarios: string[]
    fluxos: Record<string, string[]>
    modulos: Record<string, string>
    areaPaths: string[]
}

// ─── Registro de produtos ─────────────────────────────────────────────────────

const products: Record<string, Product> = {
    asmob: asmob as Product,
    cora: cora as Product,
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
Ambiente: ${product.ambiente.join(', ')}
Usuários: ${product.usuarios.join(', ')}

Fluxos:
${fluxosText}

Módulos:
${modulosText}
`.trim()
}