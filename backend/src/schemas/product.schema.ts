import { z } from 'zod'

export const productSchema = z.object({
    nome: z.string({ required_error: 'Nome é obrigatório' }).min(2, 'Nome deve ter no mínimo 2 caracteres'),
    ambiente: z.array(z.string()).min(1, 'Selecione ao menos um ambiente'),
    usuarios: z.array(z.string()).min(1, 'Informe ao menos um tipo de usuário'),
    areaPath: z.string({ required_error: 'Area Path é obrigatório' }).min(1),
    modulos: z.record(z.object({
        descricao: z.string(),
        ambiente: z.string().min(1),
    })).refine(
        m => Object.keys(m).length > 0,
        'Adicione ao menos um módulo'
    ),
})

export const updateProductSchema = productSchema

export type ProductInput = z.infer<typeof productSchema>
