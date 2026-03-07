import axios from 'axios'
import { ZodError } from 'zod'
import type { FastifyBaseLogger } from 'fastify'
import { env } from '../config/env'
import { generatedBugSchema, type GeneratedBug } from '../schemas/bug.schema'

// ─── Configurações de retry ───────────────────────────────────────────────────

const MAX_RETRIES = 3
const BACKOFF_MS = 2000
const TIMEOUT_MS = 60000

/** Erros determinísticos não se beneficiam de retry (ex: resposta inválida do modelo) */
function isTransientError(error: unknown): boolean {
  if (error instanceof ZodError) return false
  if (error instanceof SyntaxError) return false // JSON.parse failure
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    if (status && status < 500) return false // 4xx: client errors
  }
  return true
}

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

// ─── Chamada principal com retry ──────────────────────────────────────────────

export async function generateBugWithAI(
  systemPrompt: string,
  userPrompt: string,
  log: FastifyBaseLogger
): Promise<GeneratedBug> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      log.info({ attempt, maxRetries: MAX_RETRIES }, 'Chamando LLM Gateway')

      const { data } = await gatewayClient.post('/v1/messages', {
        model: env.ANTHROPIC_MODEL,
        max_tokens: 600,
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

      const validated = generatedBugSchema.parse(parsed)

      log.info('Bug gerado e validado com sucesso')
      return validated

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      log.warn({ attempt, error: lastError.message }, 'Tentativa falhou')

      if (!isTransientError(error)) {
        throw lastError
      }

      if (attempt < MAX_RETRIES) {
        const wait = BACKOFF_MS * attempt
        log.info({ waitMs: wait }, 'Aguardando antes da próxima tentativa')
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