import { z } from 'zod'

// ─── Buscar work item ─────────────────────────────────────────────────────────

export const searchItemSchema = z.object({
    id: z
        .number({ required_error: 'ID é obrigatório', invalid_type_error: 'ID deve ser um número' })
        .int('ID deve ser um inteiro')
        .positive('ID deve ser maior que zero'),
})

// ─── Gerar preview do bug via IA ──────────────────────────────────────────────

export const generateBugSchema = z.object({
    description: z
        .string({ required_error: 'Descrição é obrigatória' })
        .min(20, 'Descrição deve ter no mínimo 20 caracteres')
        .max(500, 'Descrição deve ter no máximo 500 caracteres'),

    workItemId: z
        .number({ required_error: 'workItemId é obrigatório' })
        .int()
        .positive(),
})

// ─── Criar bug no Azure DevOps ────────────────────────────────────────────────

export const createBugSchema = z.object({
    workItemId: z.number().int().positive(),

    title: z.string().min(1).max(120),
    description: z.string().min(1),
    expectedResult: z.string().min(1),

    severity: z.enum(['1- Critical', '2- High', '3- Medium', '4- Low'], {
        required_error: 'Severidade é obrigatória',
    }),

    stepIdentification: z.enum(['Quality Analysis', 'Development', 'Review', 'Deployment', 'In Production'], {
        required_error: 'Step de identificação é obrigatório',
    }),
})

// ─── Schema de validação do retorno da IA ─────────────────────────────────────

export const generatedBugSchema = z.object({
    titulo: z.string().min(1).max(120),
    descricao: z.string().min(1),
    passosReproducao: z.array(z.string()).min(3).max(7),
    resultadoEsperado: z.array(z.string()).max(3),
    severidade: z.enum(['1- Critical', '2- High', '3- Medium', '4- Low']),
})

// ─── Tipos inferidos ──────────────────────────────────────────────────────────

export type SearchItemInput = z.infer<typeof searchItemSchema>
export type GenerateBugInput = z.infer<typeof generateBugSchema>
export type CreateBugInput = z.infer<typeof createBugSchema>
export type GeneratedBug = z.infer<typeof generatedBugSchema>