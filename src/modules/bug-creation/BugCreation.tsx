import { useState } from 'react'
import { BugStepIndicator } from './components/BugStepIndicator'
import { BugStep1 } from './components/BugStep1'
import { BugStep2 } from './components/BugStep2'
import { BugStep3 } from './components/BugStep3'
import styles from './BugCreation.module.css'

export type BugData = {
  itemId: string
  description: string
  generatedTitle: string
  generatedDescription: string
  generatedSteps: string
  generatedExpected: string
  generatedSeverity: string
}

interface WorkItemResult {
  id: number
  title: string
  type: string
  state: string
  assignedTo: string
  areaPath: string
}

const initialBugData: BugData = {
  itemId: '',
  description: '',
  generatedTitle: '',
  generatedDescription: '',
  generatedSteps: '',
  generatedExpected: '',
  generatedSeverity: '',
}

function resolveStepIdentification(state: string): string {
  if (state === 'Quality Analysis') return 'Quality Analysis'
  if (state === 'Review') return 'Review'
  if (state === 'Deployment') return 'Deployment'
  if (state === 'Validation') return 'In Production'
  return 'Development'
}

export function BugCreation() {
  const [currentStep, setCurrentStep] = useState(1)
  const [workItem, setWorkItem] = useState<WorkItemResult | null>(null)
  const [bugData, setBugData] = useState<BugData>(initialBugData)

  const handleStep1Submit = (itemId: string, foundItem: WorkItemResult) => {
    setWorkItem(foundItem)
    setBugData(prev => ({ ...prev, itemId }))
    setCurrentStep(2)
  }

  const handleStep2Submit = (
    description: string,
    generated: { title: string; description: string; expectedResult: string; severity: string }
  ) => {
    setBugData(prev => ({
      ...prev,
      description,
      generatedTitle: generated.title,
      generatedDescription: generated.description,
      generatedSteps: '',
      generatedExpected: generated.expectedResult,
      generatedSeverity: generated.severity,
    }))
    setCurrentStep(3)
  }

  const handleRegenerate = async (): Promise<void> => {
    if (!workItem || !bugData.description) return

    try {
      const response = await fetch('http://localhost:3000/api/bugs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: bugData.description,
          workItemId: workItem.id,
        }),
      })
      const json = await response.json()
      if (!response.ok || !json.success) return

      setBugData(prev => ({
        ...prev,
        generatedTitle: json.data.title,
        generatedDescription: json.data.description,
        generatedExpected: json.data.expectedResult,
        generatedSeverity: json.data.severity,
      }))
    } catch {
      // silently fail — user can try again
    }
  }

  const handleStep3Confirm = async (updated: {
    title: string
    description: string
    expected: string
    severity: string
    stepIdentification: string
  }): Promise<void> => {
    if (!workItem) return

    await fetch('http://localhost:3000/api/bugs/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workItemId: workItem.id,
        title: updated.title,
        description: updated.description,
        expectedResult: updated.expected,
        severity: updated.severity,
        stepIdentification: updated.stepIdentification,
        aiAccelerated: 'Yes',
        aiTypeOfAssistance: 'Tests',
        aiTool: 'Other',
        aiToolOther: 'Other',
      }),
    })

    setCurrentStep(1)
    setBugData(initialBugData)
    setWorkItem(null)
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.header} animate-fade-up`}>
        <h1 className={styles.title}>Criação de Bugs</h1>
        <p className={styles.subtitle}>
          Busque um item do Azure DevOps e crie bugs relacionados de forma rápida e eficiente.
        </p>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: '0.08s' }}>
        <BugStepIndicator currentStep={currentStep} />
      </div>

      <div className="animate-fade-up" style={{ animationDelay: '0.16s' }}>
        <BugStep1
          active={currentStep === 1}
          completed={currentStep > 1}
          itemId={bugData.itemId}
          onSubmit={handleStep1Submit}
        />

        <BugStep2
          active={currentStep === 2}
          completed={currentStep > 2}
          locked={currentStep < 2}
          description={bugData.description}
          workItem={workItem}
          onSubmit={handleStep2Submit}
          onCancel={() => setCurrentStep(1)}
        />

        <BugStep3
          active={currentStep === 3}
          locked={currentStep < 3}
          bugData={bugData}
          stepIdentification={workItem ? resolveStepIdentification(workItem.state) : ''}
          onCancel={() => setCurrentStep(2)}
          onRegenerate={handleRegenerate}
          onConfirm={handleStep3Confirm}
        />
      </div>
    </div>
  )
}