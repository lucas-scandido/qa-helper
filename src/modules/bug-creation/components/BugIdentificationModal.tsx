import type { IdentificationData } from '../BugCreation'
import styles from './BugModal.module.css'

const severities = [
  { value: 'critical', label: 'Critical', color: '#F87171' },
  { value: 'high',     label: 'High',     color: '#FB923C' },
  { value: 'medium',   label: 'Medium',   color: '#FBBF24' },
  { value: 'low',      label: 'Low',      color: '#4ADE80' },
]

const stepIdentifications = [
  { value: 'quality_analysis', label: 'Quality Analysis' },
  { value: 'development',      label: 'Development' },
  { value: 'review',           label: 'Review' },
]

interface BugIdentificationModalProps {
  identification: IdentificationData
  onChange: (data: IdentificationData) => void
  onCancel: () => void
  onConfirm: () => void
}

export function BugIdentificationModal({ identification, onChange, onCancel, onConfirm }: BugIdentificationModalProps) {
  const isValid = identification.severity && identification.stepIdentification

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Identificação do Bug</h2>
            <p className={styles.modalSubtitle}>Preencha as informações de classificação antes de criar.</p>
          </div>
          <button className={styles.closeBtn} onClick={onCancel}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Severity */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Severidade</label>
            <div className={styles.chipGroup}>
              {severities.map(s => (
                <button
                  key={s.value}
                  className={`${styles.chip} ${identification.severity === s.value ? styles.chipSelected : ''}`}
                  style={{ '--chip-color': s.color } as React.CSSProperties}
                  onClick={() => onChange({ ...identification, severity: s.value as IdentificationData['severity'] })}
                >
                  <span className={styles.chipDot} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step Identification */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Step de Identificação</label>
            <div className={styles.chipGroup}>
              {stepIdentifications.map(s => (
                <button
                  key={s.value}
                  className={`${styles.chip} ${identification.stepIdentification === s.value ? styles.chipSelectedAccent : ''}`}
                  onClick={() => onChange({ ...identification, stepIdentification: s.value as IdentificationData['stepIdentification'] })}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnGhost} onClick={onCancel}>Cancelar</button>
          <button className={styles.btnPrimary} onClick={onConfirm} disabled={!isValid}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
            Criar Bug
          </button>
        </div>
      </div>
    </div>
  )
}