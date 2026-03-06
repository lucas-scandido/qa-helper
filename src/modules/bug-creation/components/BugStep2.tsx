import { useState } from 'react'
import styles from './BugStep.module.css'

interface WorkItemResult {
  id: number
  title: string
  type: string
  assignedTo: string
}

interface BugStep2Props {
  active: boolean
  completed: boolean
  locked: boolean
  description: string
  workItem: WorkItemResult | null
  onSubmit: (description: string, generated: { title: string; description: string; expectedResult: string; severity: string }) => void
  onCancel: () => void
}

export function BugStep2({ active, completed, description: initialDesc, workItem, onSubmit, onCancel }: BugStep2Props) {
  const [value, setValue] = useState(initialDesc)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!workItem || value.trim().length < 20) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:3000/api/bugs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: value.trim(),
          workItemId: workItem.id,
        }),
      })

      const json = await response.json()
      if (!response.ok || !json.success) throw new Error(json.error ?? 'Erro ao gerar bug')

      onSubmit(value.trim(), json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar descrição')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.stepBlock} ${active ? styles.stepActive : ''}`}>
      <div className={styles.stepHeader}>
        <div className={`${styles.stepNumber} ${active ? styles.stepNumberActive : ''} ${completed ? styles.stepNumberDone : ''}`}>
          {completed ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : '2'}
        </div>
        <h2 className={styles.stepTitle}>Descrição do Bug</h2>
      </div>

      <div className={`${styles.stepContent} ${!active && !completed ? styles.stepContentLocked : ''} ${completed ? styles.stepContentLocked : ''}`}>
        {active ? (
          <>
            <p className={styles.stepHint}>Descreva brevemente o bug encontrado para que a IA gere o card completo.</p>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Descrição</label>
              <textarea
                className={styles.textarea}
                placeholder="Ex: Ao clicar em salvar, o sistema retorna erro 500 sem mensagem ao usuário."
                value={value}
                onChange={e => setValue(e.target.value)}
                rows={4}
                disabled={loading}
              />
              <span className={styles.charCount}>{value.length}/500</span>
            </div>

            {error && (
              <div className={styles.errorBox}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <div className={styles.actionRow}>
              <button className={styles.btnGhost} onClick={onCancel}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleConfirm} disabled={value.trim().length < 20 || loading}>
                {loading ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.spinning}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Gerando...
                  </>
                ) : (
                  <>
                    Confirmar e Gerar
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <p className={styles.lockedText}>
            {completed ? 'Descrição preenchida.' : 'Informe o ID do item para liberar esta etapa.'}
          </p>
        )}
      </div>
    </div>
  )
}