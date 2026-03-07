import { useState } from 'react'
import { api } from '../../../lib/api'
import type { WorkItemResult } from '../../../types'
import { Spinner } from '../../../components/ui/Spinner'
import { ErrorBox } from '../../../components/ui/ErrorBox'
import styles from './BugStep.module.css'

interface BugStep1Props {
  active: boolean
  completed: boolean
  itemId: string
  onSubmit: (itemId: string, workItem: WorkItemResult) => void
}

export function BugStep1({ active, completed, itemId: initialId, onSubmit }: BugStep1Props) {
  const [value, setValue] = useState(initialId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<WorkItemResult | null>(null)

  const handleSearch = async () => {
    const id = value.trim()
    if (!id) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await api.get(`/api/bugs/search/${id}`)
      const json = await response.json()
      if (!response.ok || !json.success) throw new Error(json.error ?? 'Erro ao buscar item')
      setResult(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar item')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (result) onSubmit(String(result.id), result)
  }

  const handleCancel = () => {
    setResult(null)
    setValue('')
    setError(null)
  }

  return (
    <div className={`${styles.stepBlock} ${active ? styles.stepActive : ''}`}>
      <div className={styles.stepHeader}>
        <div className={`${styles.stepNumber} ${active ? styles.stepNumberActive : ''} ${completed ? styles.stepNumberDone : ''}`}>
          {completed ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : '1'}
        </div>
        <h2 className={styles.stepTitle}>Buscar Item</h2>
      </div>

      <div className={`${styles.stepContent} ${!active ? styles.stepContentLocked : ''}`}>
        {active ? (
          <>
            <p className={styles.stepHint}>Busque pelo ID do item que deseja vincular o bug.</p>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>ID do Item</label>
              <div className={styles.inputRow}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Ex: 12345"
                  value={value}
                  onChange={e => setValue(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  disabled={loading}
                />
                <button className={styles.btnPrimary} onClick={handleSearch} disabled={!value.trim() || loading}>
                  {loading ? <Spinner strokeWidth={2.5} /> : 'Buscar'}
                </button>
              </div>
            </div>

            {error && <ErrorBox message={error} />}

            {result && (
              <>
                <div className={styles.resultCard}>
                  <div className={styles.resultFoundHeader}>
                    <div className={styles.resultFoundIcon}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className={styles.resultFoundLabel}>Item Encontrado</span>
                  </div>

                  <div className={styles.resultTable}>
                    {[
                      { key: 'ID:', value: String(result.id) },
                      { key: 'Tipo:', value: result.type },
                      { key: 'Título:', value: result.title },
                      { key: 'Status:', value: result.state },
                      { key: 'Responsável:', value: result.assignedTo },
                    ].map(row => (
                      <div key={row.key} className={styles.resultRow}>
                        <span className={styles.resultKey}>{row.key}</span>
                        <span className={styles.resultValue}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.actionRow}>
                  <button className={styles.btnGhost} onClick={handleCancel}>Cancelar</button>
                  <button className={styles.btnPrimary} onClick={handleNext}>Próximo</button>
                </div>
              </>
            )}
          </>
        ) : (
          <p className={styles.lockedText}>
            {completed ? `Item #${initialId} vinculado.` : 'Informe o ID do item para liberar esta etapa.'}
          </p>
        )}
      </div>
    </div>
  )
}
