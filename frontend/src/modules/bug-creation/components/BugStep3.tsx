import { useState, useEffect } from 'react'
import type { BugData } from '../../../types'
import { BugConfirmationModal } from './BugConfirmationModal'
import { Spinner } from '../../../components/ui/Spinner'
import { ErrorBox } from '../../../components/ui/ErrorBox'
import styles from './BugStep.module.css'

const severities = [
  { value: '1- Critical', label: 'Critical', color: '#F87171' },
  { value: '2- High',     label: 'High',     color: '#FB923C' },
  { value: '3- Medium',   label: 'Medium',   color: '#FBBF24' },
  { value: '4- Low',      label: 'Low',      color: '#4ADE80' },
]

const stepIdentifications = [
  { value: 'Development',      label: 'Development' },
  { value: 'Quality Analysis', label: 'Quality Analysis' },
  { value: 'Review',           label: 'Review' },
  { value: 'Deployment',       label: 'Deployment' },
  { value: 'In Production',    label: 'In Production' },
]

// Estilos estáticos fora do componente — evita recriar objetos a cada render
const lockedChipBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  height: 34,
  padding: '0 14px',
  borderRadius: 'var(--radius-full)',
  border: '1px solid var(--border-subtle)',
  background: 'var(--bg-elevated)',
  color: 'var(--text-muted)',
  fontSize: 13,
  fontWeight: 500,
  fontFamily: "'IBM Plex Sans', sans-serif",
  cursor: 'not-allowed',
  pointerEvents: 'none',
  userSelect: 'none',
  opacity: 0.45,
}

const lockedChipSelected: React.CSSProperties = {
  ...lockedChipBase,
  opacity: 1,
  background: 'color-mix(in srgb, #6B7280 12%, transparent)',
  borderColor: '#6B7280',
  color: '#9CA3AF',
}

interface BugStep3Props {
  active: boolean
  locked: boolean
  bugData: BugData
  stepIdentification: string
  submitting: boolean
  submitError: string | null
  regenerateError: string | null
  onCancel: () => void
  onRegenerate: () => Promise<void>
  onConfirm: (updated: { title: string; description: string; expected: string; severity: string; stepIdentification: string }) => void
}

export function BugStep3({ active, locked, bugData, stepIdentification, submitting, submitError, regenerateError, onCancel, onRegenerate, onConfirm }: BugStep3Props) {
  const [regenerating, setRegenerating] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [title, setTitle] = useState(bugData.generatedTitle)
  const [description, setDescription] = useState(bugData.generatedDescription)
  const [expected, setExpected] = useState(bugData.generatedExpected)
  const [severity, setSeverity] = useState(bugData.generatedSeverity)

  useEffect(() => {
    setTitle(bugData.generatedTitle)
    setDescription(bugData.generatedDescription)
    setExpected(bugData.generatedExpected)
    setSeverity(bugData.generatedSeverity)
  }, [bugData])

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      await onRegenerate()
    } finally {
      setRegenerating(false)
    }
  }

  const isValid = title.trim() && description.trim() && expected.trim() && severity && stepIdentification

  return (
    <>
      <div className={`${styles.stepBlock} ${active ? styles.stepActive : ''}`}>
        <div className={styles.stepHeader}>
          <div className={`${styles.stepNumber} ${active ? styles.stepNumberActive : ''}`}>3</div>
          <h2 className={styles.stepTitle}>Revisão do Bug</h2>
        </div>

        <div className={`${styles.stepContent} ${locked ? styles.stepContentLocked : ''}`}>
          {active ? (
            <>
              <p className={styles.stepHint}>Revise e edite o bug gerado pela IA antes de criar.</p>

              <div className={styles.generatedBlock}>

                {/* Título */}
                <div className={styles.generatedSection}>
                  <span className={styles.generatedLabel}>Título</span>
                  <input
                    className={styles.input}
                    style={{ width: '100%' }}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                {/* Descrição */}
                <div className={styles.generatedSection}>
                  <span className={styles.generatedLabel}>Descrição</span>
                  <textarea
                    className={styles.textarea}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={5}
                    disabled={submitting}
                  />
                </div>

                {/* Resultado Esperado */}
                <div className={styles.generatedSection}>
                  <span className={styles.generatedLabel}>Resultado Esperado</span>
                  <textarea
                    className={styles.textarea}
                    value={expected}
                    onChange={e => setExpected(e.target.value)}
                    rows={3}
                    disabled={submitting}
                  />
                </div>

                {/* Severidade — bloqueada */}
                <div className={styles.generatedSection}>
                  <span className={styles.generatedLabel}>Severidade</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {severities.map(s => {
                      const isSelected = s.value === severity
                      return (
                        <span key={s.value} style={isSelected ? lockedChipSelected : lockedChipBase}>
                          <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: s.color,
                            display: 'inline-block',
                            flexShrink: 0,
                            opacity: isSelected ? 1 : 0.4,
                          }} />
                          {s.label}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Step de Identificação — bloqueado */}
                <div className={styles.generatedSection}>
                  <span className={styles.generatedLabel}>Step de Identificação</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {stepIdentifications.map(s => {
                      const isSelected = s.value === stepIdentification
                      return (
                        <span key={s.value} style={isSelected ? lockedChipSelected : lockedChipBase}>
                          {s.label}
                        </span>
                      )
                    })}
                  </div>
                </div>

              </div>

              {regenerateError && <ErrorBox message={regenerateError} />}
              {submitError && <ErrorBox message={submitError} />}

              <div className={styles.actionRow}>
                <button className={styles.btnGhost} onClick={onCancel} disabled={submitting}>Cancelar</button>
                <div className={styles.actionRowRight}>
                  <button className={styles.btnSecondary} onClick={handleRegenerate} disabled={regenerating || submitting}>
                    {regenerating ? (
                      <Spinner />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                        <path d="M21 3v5h-5"/>
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                        <path d="M8 16H3v5"/>
                      </svg>
                    )}
                    {regenerating ? 'Gerando...' : 'Gerar Nova Descrição'}
                  </button>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => setShowConfirm(true)}
                    disabled={!isValid || submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner />
                        Criando...
                      </>
                    ) : 'Criar Bug'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className={styles.lockedText}>Realize a descrição do bug para liberar esta etapa.</p>
          )}
        </div>
      </div>

      {showConfirm && (
        <BugConfirmationModal
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => {
            setShowConfirm(false)
            onConfirm({ title, description, expected, severity, stepIdentification })
          }}
        />
      )}
    </>
  )
}
