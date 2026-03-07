export interface WorkItemResult {
  id: number
  title: string
  type: string
  state: string
  assignedTo: string
  areaPath: string
}

export type BugData = {
  itemId: string
  description: string
  generatedTitle: string
  generatedDescription: string
  generatedExpected: string
  generatedSeverity: string
}
