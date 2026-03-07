import type { Product } from '../products'

// ─── System prompt ────────────────────────────────────────────────────────────

export function buildSystemPrompt(): string {
   return `
Você é um especialista em Engenharia e Qualidade de Software com amplo conhecimento em Azure DevOps.
Sua função é criar cards de bug bem detalhados com base em descrições breves fornecidas pelo usuário.

REGRAS OBRIGATÓRIAS:
- Responda APENAS em JSON válido, sem markdown, sem explicações fora do JSON
- Não invente informações que não foram fornecidas
- Responda em Português (pt-BR)
- Utilize os fluxos e módulos do produto informado como contexto
- Combine SEMPRE o contexto do work item com o contexto do produto
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

// ─── Helpers para campos ricos ────────────────────────────────────────────────

interface RichField {
   label: string
   value?: string
}

function buildRichFieldsSection(fields: RichField[]): string {
   const filled = fields.filter(f => f.value && f.value.trim().length > 0)

   if (filled.length === 0) {
      return '  (Nenhum campo detalhado disponível — apoie-se no contexto do produto)'
   }

   return filled
      .map(f => `  ${f.label}:\n  ${f.value!.slice(0, 1500)}`)
      .join('\n\n')
}

// ─── User prompt ──────────────────────────────────────────────────────────────

export function buildUserPrompt(params: {
   workItemId: number
   workItemType: string
   workItemTitle: string
   workItemState: string
   environment: string
   description: string
   product: Product
   productContext: string
   // Campos ricos do work item (opcionais)
   objective?: string
   workItemDescription?: string
   detailsBenefit?: string
   businessAcceptanceCriteria?: string
   acceptanceCriteria?: string
   technicalAcceptanceCriteria?: string
   definitionOfDone?: string
   otherIncidentCategory?: string
}): string {
   const richFields = buildRichFieldsSection([
      { label: 'Objetivo', value: params.objective },
      { label: 'Descrição do Item', value: params.workItemDescription },
      { label: 'Detalhes / Benefício', value: params.detailsBenefit },
      { label: 'Critérios de Aceite (Negócio)', value: params.businessAcceptanceCriteria },
      { label: 'Critérios de Aceite', value: params.acceptanceCriteria },
      { label: 'Critérios de Aceite (Técnicos)', value: params.technicalAcceptanceCriteria },
      { label: 'Definição de Pronto', value: params.definitionOfDone },
      { label: 'Categoria de Incidente', value: params.otherIncidentCategory },
   ])

   return `
CONTEXTO DO PRODUTO:
${params.productContext}

WORK ITEM VINCULADO:
- ID: ${params.workItemId}
- Tipo: ${params.workItemType}
- Título: ${params.workItemTitle}
- Estado: ${params.workItemState}
- Ambiente identificado: ${params.environment}

DETALHES DO WORK ITEM:
${richFields}

DESCRIÇÃO BREVE DO BUG (fornecida pelo analista):
"""
${params.description}
"""

INSTRUÇÃO DE PRIORIDADE:
Combine SEMPRE o contexto do work item com o contexto do produto para gerar o bug.
O work item informa O QUE deveria funcionar (descrição, critérios de aceite, objetivo).
O contexto do produto informa ONDE e COMO funciona (fluxos, módulos, ambiente).
Se o work item não possuir descrição ou os campos possuirem poucas informações, apoie-se prioritariamente
no contexto do produto para inferir o comportamento esperado e os fluxos envolvidos.
A descrição breve fornecida pela usuário indica APENAS o que deu errado — use-a como direcionador.

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
   - Baseie-se nos fluxos e módulos do produto para gerar passos precisos

4. resultadoEsperado
   - Array de strings com no máximo 3 itens
   - Objetivo e direto
   - Se houver critérios de aceite no work item, use-os como base

5. severidade
   - Considere o ambiente (${params.environment}) ao definir a severidade
   - Bugs em Prd tendem a ser mais severos que em Dev
   - Analisar o impacto do bug descrito e escolher automaticamente:
     "1- Critical": impede uso do sistema ou causa perda de dados
     "2- High": impacta funcionalidade principal mas tem contorno
     "3- Medium": impacta funcionalidade secundária
     "4- Low": problema cosmético ou de baixo impacto

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