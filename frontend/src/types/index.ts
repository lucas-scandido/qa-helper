export interface WorkItemResult {
  id: number
  title: string
  type: string
  state: string
  assignedTo: string
  areaPath: string
  environment: string
  // Campos ricos (opcionais)
  objective?: string
  description?: string
  detailsBenefit?: string
  businessAcceptanceCriteria?: string
  acceptanceCriteria?: string
  technicalAcceptanceCriteria?: string
  definitionOfDone?: string
  otherIncidentCategory?: string
}

export type BugData = {
  itemId: string
  description: string
  generatedTitle: string
  generatedDescription: string
  generatedExpected: string
  generatedSeverity: string
}

export interface ProductContext {
  nome: string
  tipo: string
  plataformas: string[]
  usuarios: string[]
  modulos: Record<string, string>
  fluxos: Record<string, string[]>
  areaPaths: string[]
}