import { useState } from 'react'
import { api } from '../../../lib/api'
import type { WorkItemResult } from '../../../types'
import { Spinner } from '../../../components/ui/Spinner'
import { ErrorBox } from '../../../components/ui/ErrorBox'
import styles from './BugStep.module.css'

const MAX_DESCRIPTION_LENGTH = 500

interface BugStep2Props {
  active: boolean
  completed: boolean
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
      const response = await api.post('/api/bugs/generate', {
        description: value.trim(),
        workItemId: workItem.id,
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

  const isNearLimit = value.length > 450
  const isAtLimit = value.length >= MAX_DESCRIPTION_LENGTH

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
                onChange={e => setValue(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
                rows={4}
                disabled={loading}
                maxLength={MAX_DESCRIPTION_LENGTH}
              />
              <span
                className={styles.charCount}
                style={isAtLimit ? { color: 'var(--status-danger)' } : isNearLimit ? { color: 'var(--status-warning)' } : undefined}
              >
                {value.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>

            {error && <ErrorBox message={error} />}

            <div className={styles.actionRow}>
              <button className={styles.btnGhost} onClick={onCancel}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={handleConfirm} disabled={value.trim().length < 20 || loading}>
                {loading ? (
                  <>
                    <Spinner size={15} />
                    Gerando...
                  </>
                ) : 'Confirmar e Gerar'}
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
