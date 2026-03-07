import { useState } from 'react'
import { api } from '../../lib/api'
import type { WorkItemResult, BugData } from '../../types'
import { BugStepIndicator } from './components/BugStepIndicator'
import { BugStep1 } from './components/BugStep1'
import { BugStep2 } from './components/BugStep2'
import { BugStep3 } from './components/BugStep3'
import styles from './BugCreation.module.css'

const initialBugData: BugData = {
  itemId: '',
  description: '',
  generatedTitle: '',
  generatedDescription: '',
  generatedExpected: '',
  generatedSeverity: '',
}

const STATE_OVERRIDES: Record<string, string> = { Validation: 'In Production' }

function resolveStepIdentification(state: string): string {
  return STATE_OVERRIDES[state] ?? state
}

export function BugCreation() {
  const [currentStep, setCurrentStep] = useState(1)
  const [workItem, setWorkItem] = useState<WorkItemResult | null>(null)
  const [bugData, setBugData] = useState<BugData>(initialBugData)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [regenerateError, setRegenerateError] = useState<string | null>(null)

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
      generatedExpected: generated.expectedResult,
      generatedSeverity: generated.severity,
    }))
    setCurrentStep(3)
  }

  const handleRegenerate = async (): Promise<void> => {
    if (!workItem || !bugData.description) return

    setRegenerateError(null)
    try {
      const response = await api.post('/api/bugs/generate', {
        description: bugData.description,
        workItemId: workItem.id,
      })
      const json = await response.json()
      if (!response.ok || !json.success) throw new Error(json.error ?? 'Erro ao regenerar bug')

      setBugData(prev => ({
        ...prev,
        generatedTitle: json.data.title,
        generatedDescription: json.data.description,
        generatedExpected: json.data.expectedResult,
        generatedSeverity: json.data.severity,
      }))
    } catch (err) {
      setRegenerateError(err instanceof Error ? err.message : 'Erro ao regenerar descrição')
    }
  }

  const handleStep3Confirm = async (updated: {
    title: string
    description: string
    expected: string
    severity: string
    stepIdentification: string
  }): Promise<void> => {
    if (!workItem || submitting) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const response = await api.post('/api/bugs/create', {
        workItemId: workItem.id,
        title: updated.title,
        description: updated.description,
        expectedResult: updated.expected,
        severity: updated.severity,
        stepIdentification: updated.stepIdentification,
      })

      const json = await response.json()
      if (!response.ok || !json.success) throw new Error(json.error ?? 'Erro ao criar bug')

      setCurrentStep(1)
      setBugData(initialBugData)
      setWorkItem(null)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao criar bug no Azure DevOps')
    } finally {
      setSubmitting(false)
    }
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
          submitting={submitting}
          submitError={submitError}
          regenerateError={regenerateError}
          onCancel={() => setCurrentStep(2)}
          onRegenerate={handleRegenerate}
          onConfirm={handleStep3Confirm}
        />
      </div>
    </div>
  )
}
