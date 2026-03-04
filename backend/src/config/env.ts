import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  PORT: z.string().default('3000'),

  AZURE_ORGANIZATION: z.string({ required_error: 'AZURE_ORGANIZATION é obrigatório' }),
  AZURE_PROJECT: z.string({ required_error: 'AZURE_PROJECT é obrigatório' }),
  AZURE_PAT: z.string({ required_error: 'AZURE_PAT é obrigatório' }),

  ANTHROPIC_AUTH_TOKEN: z.string({ required_error: 'ANTHROPIC_AUTH_TOKEN é obrigatório' }),
  ANTHROPIC_BASE_URL: z.string({ required_error: 'ANTHROPIC_BASE_URL é obrigatório' }),
  ANTHROPIC_MODEL: z.string().default('claude-sonnet-4-6'),

  FRONTEND_URL: z.string().default('http://localhost:5173'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:')
  parsed.error.errors.forEach(err => {
    console.error(`   - ${err.path.join('.')}: ${err.message}`)
  })
  process.exit(1)
}

export const env = parsed.data