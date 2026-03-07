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
        .max(200, 'Descrição deve ter no máximo 200 caracteres'),

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

// ─── Schema de cadastro de produto ────────────────────────────────────────────

export const productSchema = z.object({
    nome: z.string({ required_error: 'Nome do produto é obrigatório' }).min(1, 'Nome é obrigatório'),
    tipo: z.string().default('Aplicação'),
    plataformas: z.array(z.string()).min(1, 'Selecione ao menos uma plataforma'),
    usuarios: z.array(z.string()).min(1, 'Informe ao menos um tipo de usuário'),
    modulos: z.record(z.string(), z.string()).refine(
        (val) => Object.keys(val).length > 0,
        { message: 'Cadastre ao menos um módulo' }
    ),
    fluxos: z.record(z.string(), z.array(z.string())).default({}),
    areaPaths: z.array(z.string()).min(1, 'Informe ao menos um Area Path'),
})

// ─── Tipos inferidos ──────────────────────────────────────────────────────────

export type SearchItemInput = z.infer<typeof searchItemSchema>
export type GenerateBugInput = z.infer<typeof generateBugSchema>
export type CreateBugInput = z.infer<typeof createBugSchema>
export type GeneratedBug = z.infer<typeof generatedBugSchema>
export type ProductInput = z.infer<typeof productSchema>