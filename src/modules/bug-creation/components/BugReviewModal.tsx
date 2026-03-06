import { useState } from 'react'
import type { BugData } from '../BugCreation'
import styles from './BugModal.module.css'

const severityConfig: Record<string, { label: string; color: string }> = {
  '1- Critical': { label: 'Critical', color: '#F87171' },
  '2- High': { label: 'High', color: '#FB923C' },
  '3- Medium': { label: 'Medium', color: '#FBBF24' },
  '4- Low': { label: 'Low', color: '#4ADE80' },
}

function resolveStepIdentification(state: string): string {
  if (state === 'Quality Analysis') return 'Quality Analysis'
  if (state === 'Review') return 'Review'
  if (state === 'Deployment') return 'Deployment'
  if (state === 'Validation') return 'In Production'
  return 'Development'
}

interface BugReviewModalProps {
  bugData: BugData
  workItemState: string
  onCancel: () => void
  onConfirm: (updated: Partial<BugData>) => void
}

export function BugReviewModal({ bugData, workItemState, onCancel, onConfirm }: BugReviewModalProps) {
  const [title, setTitle] = useState(bugData.generatedTitle)
  const [description, setDescription] = useState(bugData.generatedDescription)
  const [expected, setExpected] = useState(bugData.generatedExpected)

  const severity = bugData.generatedSeverity
  const stepIdentification = resolveStepIdentification(workItemState)

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
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
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
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Resultado Esperado</label>
            <textarea className={styles.fieldTextarea} value={expected} onChange={e => setExpected(e.target.value)} rows={3} />
          </div>

          {/* Severidade — bloqueada, preenchida pela IA */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Severidade</label>
            <div className={styles.chipGroup}>
              {Object.entries(severityConfig).map(([value, config]) => {
                const isSelected = value === severity
                return (
                  <button
                    key={value}
                    className={styles.chip}
                    style={{
                      '--chip-color': config.color,
                      opacity: isSelected ? 1 : 0.35,
                      cursor: 'not-allowed',
                      pointerEvents: 'none',
                      ...(isSelected && {
                        background: 'color-mix(in srgb, #6B7280 12%, transparent)',
                        borderColor: '#6B7280',
                        color: '#9CA3AF',
                      }),
                    } as React.CSSProperties}
                    disabled
                  >
                    <span className={styles.chipDot} />
                    {config.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step de Identificação — bloqueado, derivado do status */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Step de Identificação</label>
            <div className={styles.chipGroup}>
              {['Development', 'Quality Analysis', 'Review', 'Deployment', 'In Production'].map(step => {
                const isSelected = step === stepIdentification
                return (
                  <button
                    key={step}
                    className={styles.chip}
                    style={{
                      opacity: isSelected ? 1 : 0.35,
                      cursor: 'not-allowed',
                      pointerEvents: 'none',
                      ...(isSelected && {
                        background: 'color-mix(in srgb, #6B7280 12%, transparent)',
                        borderColor: '#6B7280',
                        color: '#9CA3AF',
                      }),
                    }}
                    disabled
                  >
                    {step}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnGhost} onClick={onCancel}>Cancelar</button>
          <button
            className={styles.btnPrimary}
            onClick={() => onConfirm({ generatedTitle: title, generatedDescription: description, generatedExpected: expected })}
          >
            Confirmar e Continuar
          </button>
        </div>
      </div>
    </div>
  )
}