export interface ProductData {
  nome: string
  tipo?: string
  ambiente: string[]
  usuarios: string[]
  modulos: Record<string, { descricao: string; ambiente: string }>
  areaPaths: string[]
}

export interface WorkItemResult {
  id: number
  title: string
  type: string
  state: string
  assignedTo: string
  areaPath: string
  hasProductContext: boolean
  product: ProductData | null
}

export type BugData = {
  itemId: string
  description: string
  generatedTitle: string
  generatedDescription: string
  generatedExpected: string
  generatedSeverity: string
}
