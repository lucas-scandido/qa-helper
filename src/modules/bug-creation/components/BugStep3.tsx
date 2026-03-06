import { useState } from 'react'
import type { BugData } from '../BugCreation'
import styles from './BugStep.module.css'

interface BugStep3Props {
  active: boolean
  locked: boolean
  bugData: BugData
  onCancel: () => void
  onRegenerate: () => Promise<void>
  onConfirm: () => void
}

export function BugStep3({ active, locked, bugData, onCancel, onRegenerate, onConfirm }: BugStep3Props) {
  const [regenerating, setRegenerating] = useState(false)

  const handleRegenerate = async () => {
    setRegenerating(true)
    await onRegenerate()
    setRegenerating(false)
  }

  // Separa descrição dos passos
  const fullText = bugData.generatedDescription
  const passosIndex = fullText.indexOf('Passos para reprodução:')
  const descricaoPura = passosIndex !== -1 ? fullText.slice(0, passosIndex).trim() : fullText.trim()
  const passosBloco = passosIndex !== -1 ? fullText.slice(passosIndex) : ''

  const passos = passosBloco
    .split('\n')
    .filter(l => l.match(/^\d+\./))
    .map(l => l.replace(/^\d+\.\s*/, '').trim())

  const expectedLines = bugData.generatedExpected
    .split('\n')
    .filter(l => l.trim())
    .map(l => l.replace(/^-\s*/, '').trim())

  return (
    <div className={`${styles.stepBlock} ${active ? styles.stepActive : ''}`}>
      <div className={styles.stepHeader}>
        <div className={`${styles.stepNumber} ${active ? styles.stepNumberActive : ''}`}>3</div>
        <h2 className={styles.stepTitle}>Revisar Bug</h2>
      </div>

      <div className={`${styles.stepContent} ${locked ? styles.stepContentLocked : ''}`}>
        {active ? (
          <>
            <p className={styles.stepHint}>Revise o bug gerado pela IA. Você pode gerar uma nova versão ou confirmar.</p>

            <div className={styles.generatedBlock}>

              {/* Título */}
              <div className={styles.generatedSection}>
                <span className={styles.generatedLabel}>Título</span>
                <p className={styles.generatedTitle}>{bugData.generatedTitle}</p>
              </div>

              {/* Descrição */}
              <div className={styles.generatedSection}>
                <span className={styles.generatedLabel}>Descrição</span>
                <p className={styles.generatedText}>{descricaoPura}</p>
              </div>

              {/* Passos de Reprodução — sem label, numerados */}
              {passos.length > 0 && (
                <div className={styles.generatedSection}>
                  <span className={styles.generatedLabel}>Passos de Reprodução</span>
                  <ol className={styles.generatedOl}>
                    {passos.map((passo, i) => (
                      <li key={i} className={styles.generatedOlItem}>
                        <span className={styles.generatedOlNum}>{i + 1}</span>
                        <span>{passo}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Resultado Esperado — traço */}
              {expectedLines.length > 0 && (
                <div className={styles.generatedSection}>
                  <span className={styles.generatedLabel}>Resultado Esperado</span>
                  <ul className={styles.generatedUl}>
                    {expectedLines.map((item, i) => (
                      <li key={i} className={styles.generatedUlItem}>
                        <span className={styles.generatedDash}>—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            <div className={styles.actionRow}>
              <button className={styles.btnGhost} onClick={onCancel}>Cancelar</button>
              <div className={styles.actionRowRight}>
                <button className={styles.btnSecondary} onClick={handleRegenerate} disabled={regenerating}>
                  {regenerating ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.spinning}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
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
                <button className={styles.btnPrimary} onClick={onConfirm}>
                  Confirmar Revisão
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