import styles from './BugStepIndicator.module.css'

const steps = [
  { number: 1, label: 'Buscar Item' },
  { number: 2, label: 'Descrição do Bug' },
  { number: 3, label: 'Confirmar Bug' },
]

interface BugStepIndicatorProps {
  currentStep: number
}

export function BugStepIndicator({ currentStep }: BugStepIndicatorProps) {
  return (
    <div className={styles.wrapper}>
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number
        const isActive = currentStep === step.number

        return (
          <div key={step.number} className={styles.stepGroup}>
            <div className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
              <div className={styles.circle}>
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <span className={styles.label}>{step.label}</span>
            </div>

            {index < steps.length - 1 && (
              <div className={`${styles.connector} ${isCompleted ? styles.connectorDone : ''}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}