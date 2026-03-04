import { useState } from 'react'
import { BugStepIndicator } from './components/BugStepIndicator'
import { BugStep1 } from './components/BugStep1'
import { BugStep2 } from './components/BugStep2'
import { BugStep3 } from './components/BugStep3'
import { BugReviewModal } from './components/BugReviewModal'
import { BugIdentificationModal } from './components/BugIdentificationModal'
import styles from './BugCreation.module.css'

export type BugData = {
  itemId: string
  description: string
  generatedTitle: string
  generatedDescription: string
  generatedSteps: string
  generatedExpected: string
}

export type IdentificationData = {
  severity: 'critical' | 'high' | 'medium' | 'low' | ''
  stepIdentification: 'quality_analysis' | 'development' | 'review' | ''
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
}

export function BugCreation() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showIdentificationModal, setShowIdentificationModal] = useState(false)
  const [workItem, setWorkItem] = useState<WorkItemResult | null>(null)
  const [bugData, setBugData] = useState<BugData>(initialBugData)
  const [identification, setIdentification] = useState<IdentificationData>({
    severity: '',
    stepIdentification: '',
  })

  const handleStep1Submit = (itemId: string, foundItem: WorkItemResult) => {
    setWorkItem(foundItem)
    setBugData(prev => ({ ...prev, itemId }))
    setCurrentStep(2)
  }

  const handleStep2Submit = (
    description: string,
    generated: { title: string; description: string; expectedResult: string }
  ) => {
    setBugData(prev => ({
      ...prev,
      description,
      generatedTitle: generated.title,
      generatedDescription: generated.description,
      generatedSteps: '',
      generatedExpected: generated.expectedResult,
    }))
    setCurrentStep(3)
  }

  const handleRegenerate = async () => {
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
      }))
    } catch {
      // silently fail — user can try again
    }
  }

  const handleConfirmReview = (updatedData: Partial<BugData>) => {
    setBugData(prev => ({ ...prev, ...updatedData }))
    setShowReviewModal(false)
    setShowIdentificationModal(true)
  }

  const handleFinalConfirm = () => {
    setShowIdentificationModal(false)
    setCurrentStep(1)
    setBugData(initialBugData)
    setWorkItem(null)
    setIdentification({ severity: '', stepIdentification: '' })
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
          onCancel={() => setCurrentStep(2)}
          onRegenerate={handleRegenerate}
          onConfirm={() => setShowReviewModal(true)}
        />
      </div>

      {showReviewModal && (
        <BugReviewModal
          bugData={bugData}
          onCancel={() => setShowReviewModal(false)}
          onConfirm={handleConfirmReview}
        />
      )}

      {showIdentificationModal && (
        <BugIdentificationModal
          identification={identification}
          onChange={setIdentification}
          onCancel={() => {
            setShowIdentificationModal(false)
            setShowReviewModal(true)
          }}
          onConfirm={handleFinalConfirm}
        />
      )}
    </div>
  )
}