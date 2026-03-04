import type { BugData } from '../BugCreation'
import styles from './BugStep.module.css'

interface BugStep3Props {
  active: boolean
  locked: boolean
  bugData: BugData
  onCancel: () => void
  onRegenerate: () => void
  onConfirm: () => void
}

export function BugStep3({ active, locked, bugData, onCancel, onRegenerate, onConfirm }: BugStep3Props) {
  return (
    <div className={`${styles.stepBlock} ${active ? styles.stepActive : ''}`}>
      <div className={styles.stepHeader}>
        <div className={`${styles.stepNumber} ${active ? styles.stepNumberActive : ''}`}>3</div>
        <h2 className={styles.stepTitle}>Confirmar Bug</h2>
      </div>

      <div className={`${styles.stepContent} ${locked ? styles.stepContentLocked : ''}`}>
        {active ? (
          <>
            <p className={styles.stepHint}>Revise o bug gerado pela IA. Você pode gerar uma nova versão ou confirmar.</p>

            <div className={styles.generatedBlock}>
              {/* Title */}
              <div className={styles.generatedSection}>
                <span className={styles.generatedLabel}>Título</span>
                <p className={styles.generatedTitle}>{bugData.generatedTitle}</p>
              </div>

              {/* Description + Steps */}
              <div className={styles.generatedSection}>
                <span className={styles.generatedLabel}>Descrição</span>
                <p className={styles.generatedText}>{bugData.generatedDescription}</p>
                {bugData.generatedSteps && (
                  <>
                    <p className={styles.generatedSubLabel}>Passos de Reprodução</p>
                    <p className={styles.generatedText} style={{ whiteSpace: 'pre-line' }}>{bugData.generatedSteps}</p>
                  </>
                )}
              </div>

              {/* Expected */}
              <div className={styles.generatedSection}>
                <span className={styles.generatedLabel}>Resultado Esperado</span>
                <p className={styles.generatedText}>{bugData.generatedExpected}</p>
              </div>
            </div>

            <div className={styles.actionRow}>
              <button className={styles.btnGhost} onClick={onCancel}>Cancelar</button>
              <div className={styles.actionRowRight}>
                <button className={styles.btnSecondary} onClick={onRegenerate}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 3v5h-5"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                    <path d="M8 16H3v5"/>
                  </svg>
                  Gerar Nova Descrição
                </button>
                <button className={styles.btnPrimary} onClick={onConfirm}>
                  Confirmar
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className={styles.lockedText}>Realize a descrição do bug para liberar esta etapa.</p>
        )}
      </div>
    </div>
  )
}