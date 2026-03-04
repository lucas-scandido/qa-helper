import { useState } from 'react'
import type { BugData } from '../BugCreation'
import styles from './BugModal.module.css'

interface BugReviewModalProps {
  bugData: BugData
  onCancel: () => void
  onConfirm: (updated: Partial<BugData>) => void
}

export function BugReviewModal({ bugData, onCancel, onConfirm }: BugReviewModalProps) {
  const [title, setTitle] = useState(bugData.generatedTitle)
  const [description, setDescription] = useState(bugData.generatedDescription)
  const [steps, setSteps] = useState(bugData.generatedSteps)
  const [expected, setExpected] = useState(bugData.generatedExpected)

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Revisar Bug Gerado</h2>
            <p className={styles.modalSubtitle}>Leia e edite o conteúdo antes de confirmar.</p>
          </div>
          <button className={styles.closeBtn} onClick={onCancel}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Título</label>
            <input className={styles.fieldInput} value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Descrição</label>
            <textarea className={styles.fieldTextarea} value={description} onChange={e => setDescription(e.target.value)} rows={4} />
            <label className={styles.fieldSubLabel}>Passos de Reprodução</label>
            <textarea className={styles.fieldTextarea} value={steps} onChange={e => setSteps(e.target.value)} rows={5} />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Resultado Esperado</label>
            <textarea className={styles.fieldTextarea} value={expected} onChange={e => setExpected(e.target.value)} rows={3} />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnGhost} onClick={onCancel}>Cancelar</button>
          <button
            className={styles.btnPrimary}
            onClick={() => onConfirm({ generatedTitle: title, generatedDescription: description, generatedSteps: steps, generatedExpected: expected })}
          >
            Confirmar e Continuar
          </button>
        </div>
      </div>
    </div>
  )
}