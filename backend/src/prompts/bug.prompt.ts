import type { Product } from '../products'

// ─── System prompt ────────────────────────────────────────────────────────────

export function buildSystemPrompt(): string {
    return `
Você é um especialista em Engenharia e Qualidade de Software com amplo conhecimento em Azure DevOps.
Sua função é criar cards de bug bem detalhados com base em descrições fornecidas por analistas de QA.

REGRAS OBRIGATÓRIAS:
- Responda APENAS em JSON válido, sem markdown, sem explicações fora do JSON
- Não invente informações que não foram fornecidas
- Responda em Português (pt-BR)
- Utilize os fluxos e módulos do produto informado como contexto
- Siga exatamente o contrato de resposta abaixo

CONTRATO DE RESPOSTA:
{
  "titulo": "string (máx 120 caracteres)",
  "descricao": "string",
  "passosReproducao": ["string", "string"],
  "resultadoEsperado": ["string", "string"]
}
`.trim()
}

// ─── User prompt ──────────────────────────────────────────────────────────────

export function buildUserPrompt(params: {
    workItemId: number
    workItemType: string
    workItemTitle: string
    workItemState: string
    description: string
    product: Product
    productContext: string
}): string {
    return `
CONTEXTO DO PRODUTO:
${params.productContext}

WORK ITEM VINCULADO:
- ID: ${params.workItemId}
- Tipo: ${params.workItemType}
- Título: ${params.workItemTitle}
- Estado: ${params.workItemState}

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
  ]
}
`.trim()
}