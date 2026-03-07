import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import styles from './BugStatsCard.module.css'

function formatMonthYear(date: Date): string {
  return date
    .toLocaleString('pt-BR', { month: 'short', year: 'numeric' })
    .replace(' de ', '/')
    .replace(/\./g, '')
}

export function BugStatsCard() {
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        setError(false)
        const response = await api.get('/api/bugs/stats')
        const json = await response.json()

        if (!response.ok || !json.success) {
          setError(true)
          return
        }

        setTotal(json.data.total)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const now = new Date()
  const startLabel = formatMonthYear(new Date(now.getFullYear(), 0, 1))
  const endLabel = formatMonthYear(now)
  const periodLabel = `${startLabel} até ${endLabel}`

  return (
    <div className={styles.statsCard}>
      <div className={styles.statsTop}>
        <p className={styles.statsTitle}>Bugs criados por IA:</p>
        {loading ? (
          <span className={styles.statsCount} style={{ opacity: 0.3 }}>—</span>
        ) : error ? (
          <span className={styles.statsCount} style={{ color: 'var(--text-muted)', fontSize: 14 }}>Erro</span>
        ) : (
          <span className={styles.statsCount}>{total}</span>
        )}
      </div>
      <div className={styles.statsFooter}>
        <span className={styles.statsPeriod}>
          {loading ? 'Carregando...' : error ? 'Não foi possível carregar' : `Período: ${periodLabel}`}
        </span>
      </div>
    </div>
  )
}
