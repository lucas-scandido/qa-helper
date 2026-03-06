import axios from 'axios'
import { env } from '../config/env'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface GeneratedBug {
  titulo: string
  descricao: string
  passosReproducao: string[]
  resultadoEsperado: string[]
  severidade: '1- Critical' | '2- High' | '3- Medium' | '4- Low'
}

// ─── Configurações de retry ───────────────────────────────────────────────────

const MAX_RETRIES = 3
const BACKOFF_MS = 2000
const TIMEOUT_MS = 60000

// ─── Cliente HTTP para o LLM Gateway ─────────────────────────────────────────

const gatewayClient = axios.create({
  baseURL: env.ANTHROPIC_BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': env.ANTHROPIC_AUTH_TOKEN,
    'anthropic-version': '2023-06-01',
  },
})

// ─── Validação do retorno da IA ───────────────────────────────────────────────

function validateGeneratedBug(data: unknown): GeneratedBug {
  if (!data || typeof data !== 'object') {
    throw new Error('Resposta da IA não é um objeto válido')
  }

  const d = data as Record<string, unknown>
  const errors: string[] = []

  if (!d.titulo || typeof d.titulo !== 'string')       errors.push('"titulo" deve ser string')
  if (!d.descricao || typeof d.descricao !== 'string') errors.push('"descricao" deve ser string')
  if (!Array.isArray(d.passosReproducao))              errors.push('"passosReproducao" deve ser array')
  if (!Array.isArray(d.resultadoEsperado))             errors.push('"resultadoEsperado" deve ser array')

  const severidadesValidas = ['1- Critical', '2- High', '3- Medium', '4- Low']
  if (!d.severidade || !severidadesValidas.includes(d.severidade as string)) {
    errors.push('"severidade" deve ser 1- Critical, 2- High, 3- Medium ou 4- Low')
  }

  if (typeof d.titulo === 'string' && d.titulo.length > 120) {
    errors.push(`"titulo" excede 120 caracteres (${d.titulo.length})`)
  }

  if (Array.isArray(d.passosReproducao)) {
    const len = d.passosReproducao.length
    if (len < 3 || len > 7) errors.push(`"passosReproducao" deve ter entre 3 e 7 itens (recebido: ${len})`)
  }

  if (Array.isArray(d.resultadoEsperado) && d.resultadoEsperado.length > 3) {
    errors.push('"resultadoEsperado" deve ter no máximo 3 itens')
  }

  if (errors.length > 0) {
    throw new Error(`JSON da IA inválido:\n- ${errors.join('\n- ')}`)
  }

  return d as unknown as GeneratedBug
}

// ─── Chamada principal com retry ──────────────────────────────────────────────

export async function generateBugWithAI(
  systemPrompt: string,
  userPrompt: string
): Promise<GeneratedBug> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🤖 Tentativa ${attempt}/${MAX_RETRIES} — chamando LLM Gateway...`)

      const { data } = await gatewayClient.post('/v1/messages', {
        model: env.ANTHROPIC_MODEL,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      })

      const textBlock = data?.content?.find(
        (b: { type: string }) => b.type === 'text'
      ) as { type: 'text'; text: string } | undefined

      if (!textBlock?.text) {
        throw new Error('Resposta do gateway não contém bloco de texto')
      }

      const clean = textBlock.text.replace(/```json\n?|\n?```/g, '').trim()
      const parsed: unknown = JSON.parse(clean)

      const validated = validateGeneratedBug(parsed)

      console.log('✅ Bug gerado e validado com sucesso')
      return validated

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`⚠️  Tentativa ${attempt} falhou: ${lastError.message}`)

      if (attempt < MAX_RETRIES) {
        const wait = BACKOFF_MS * attempt
        console.log(`⏳ Aguardando ${wait / 1000}s antes da próxima tentativa...`)
        await new Promise(resolve => setTimeout(resolve, wait))
      }
    }
  }

  throw new Error(`Falha após ${MAX_RETRIES} tentativas. Último erro: ${lastError?.message}`)
}

// ─── Formata o bug gerado para o frontend ─────────────────────────────────────

export function formatGeneratedBug(bug: GeneratedBug) {
  const descriptionFormatted = [
    bug.descricao,
    '',
    'Passos para reprodução:',
    ...bug.passosReproducao.map((step, i) => `${i + 1}. ${step}`),
  ].join('\n')

  const expectedResultFormatted = bug.resultadoEsperado
    .map(item => `- ${item}`)
    .join('\n')

  return {
    title: bug.titulo,
    description: descriptionFormatted,
    expectedResult: expectedResultFormatted,
    severity: bug.severidade,
  }
}