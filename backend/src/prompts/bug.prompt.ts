import type { Product } from '../products'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(value: string | null): string | null {
    if (!value) return null
    return value
        .replace(/<[^>]+>/g, ' ')   // remove tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s{2,}/g, ' ')    // colapsa espaços múltiplos
        .trim() || null
}

// ─── System prompt ────────────────────────────────────────────────────────────

export function buildSystemPrompt(): string {
    return `
Você é um especialista em Engenharia e Qualidade de Software com amplo conhecimento em Azure DevOps.
Sua função é criar cards de bug bem detalhados com base em descrições fornecidas por analistas de QA.

REGRAS OBRIGATÓRIAS:
- Responda APENAS em JSON válido, sem markdown, sem explicações fora do JSON
- Não invente informações que não foram fornecidas
- Responda em Português (pt-BR)
- Utilize os módulos do produto informado como contexto
- Siga exatamente o contrato de resposta abaixo

CONTRATO DE RESPOSTA:
{
  "titulo": "string (máx 120 caracteres)",
  "descricao": "string",
  "passosReproducao": ["string", "string"],
  "resultadoEsperado": ["string", "string"],
  "severidade": "1- Critical" | "2- High" | "3- Medium" | "4- Low"
}
`.trim()
}

// ─── User prompt ──────────────────────────────────────────────────────────────

function buildWorkItemContext(params: {
    workItemId: number
    workItemType: string
    workItemTitle: string
    workItemState: string
    workItemDescription: string | null
    workItemObjective: string | null
    workItemBusinessAC: string | null
    workItemTechnicalAC: string | null
    workItemAC: string | null
    workItemDoD: string | null
}): { section: string; isRich: boolean } {
    const lines: string[] = [
        `- ID: ${params.workItemId}`,
        `- Tipo: ${params.workItemType}`,
        `- Título: ${params.workItemTitle}`,
        `- Estado: ${params.workItemState}`,
    ]

    const richFields: string[] = []

    const description = stripHtml(params.workItemDescription)
    const objective = stripHtml(params.workItemObjective)
    const businessAC = stripHtml(params.workItemBusinessAC)
    const technicalAC = stripHtml(params.workItemTechnicalAC)
    const ac = stripHtml(params.workItemAC)
    const dod = stripHtml(params.workItemDoD)

    if (description) richFields.push(`- Descrição: ${description}`)
    if (objective) richFields.push(`- Objetivo: ${objective}`)
    if (businessAC) richFields.push(`- Critérios de Aceite (Negócio): ${businessAC}`)
    if (technicalAC) richFields.push(`- Critérios de Aceite (Técnico): ${technicalAC}`)
    if (ac) richFields.push(`- Critérios de Aceite: ${ac}`)
    if (dod) richFields.push(`- Definição de Pronto: ${dod}`)

    return {
        section: [...lines, ...richFields].join('\n'),
        isRich: richFields.length > 0,
    }
}

export function buildUserPrompt(params: {
    workItemId: number
    workItemType: string
    workItemTitle: string
    workItemState: string
    workItemDescription: string | null
    workItemObjective: string | null
    workItemBusinessAC: string | null
    workItemTechnicalAC: string | null
    workItemAC: string | null
    workItemDoD: string | null
    testEnvironment: string
    description: string
    product: Product
    productContext: string
}): string {
    const { section: workItemSection, isRich } = buildWorkItemContext(params)

    const fallbackNote = !isRich
        ? `\nOBSERVAÇÃO: O work item não possui descrição ou critérios de aceite preenchidos. Apoie-se no contexto do produto para inferir o comportamento esperado e construir os passos de reprodução.\n`
        : ''

    return `
CONTEXTO DO PRODUTO:
${params.productContext}

WORK ITEM VINCULADO:
${workItemSection}
${fallbackNote}
AMBIENTE ONDE O BUG FOI IDENTIFICADO: ${params.testEnvironment}

DESCRIÇÃO BREVE DO BUG (fornecida pelo analista):
"""
${params.description}
"""

TAREFA:
Crie um card de bug profissional seguindo os requisitos abaixo.

REQUISITOS:

1. titulo
   - Claro e objetivo, máximo 120 caracteres
   - Não iniciar com "Bug:" ou "Defect:"
   - Não reutilizar a descrição breve como título

2. descricao
   - Deve iniciar com: "Durante os testes do item ${params.workItemId}, foi identificado que..."
   - Linguagem clara, objetiva e detalhada
   - Informar o impacto para o usuário
   - NÃO incluir passos de reprodução neste campo

3. passosReproducao
   - Array de strings com 3 a 7 itens
   - Ordem lógica de ações reais do usuário dentro do produto
   - Cada item representa uma ação específica

4. resultadoEsperado
   - Array de strings com no máximo 3 itens
   - Objetivo e direto

5. severidade
   - Analisar o impacto do bug descrito e escolher automaticamente um dos valores: "1- Critical", "2- High", "3- Medium" ou "4- Low"
   - 1- Critical: impede uso do sistema ou causa perda de dados
   - 2- High: impacta funcionalidade principal mas tem contorno
   - 3- Medium: impacta funcionalidade secundária
   - 4- Low: problema cosmético ou de baixo impacto

EXEMPLO DE RESPOSTA:
{
  "titulo": "Ausência de mensagem de erro para upload de csv com valores inválidos",
  "descricao": "Durante os testes do item 12345, foi identificado que o sistema permite realizar o upload de um .csv em Edição em Lote no módulo Hierarquia contendo valores inválidos, sem retornar nenhuma mensagem de erro ao usuário.",
  "passosReproducao": [
    "Acessar o módulo Hierarquia",
    "Selecionar a opção Edição em Lote",
    "Realizar upload de um arquivo .csv com valores inválidos",
    "Observar o comportamento do sistema"
  ],
  "resultadoEsperado": [
    "O sistema deve validar os dados do arquivo .csv.",
    "Uma mensagem de erro deve ser exibida indicando os valores inválidos.",
    "O upload não deve ser concluído até que os dados sejam corrigidos."
  ],
  "severidade": "2- High"
}
`.trim()
}