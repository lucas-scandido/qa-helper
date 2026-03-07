import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './BugModal.module.css'

interface BugSuccessModalProps {
  bugId: number
  bugUrl: string
  parentItemId: number
  onNewBugSameItem: () => void
  onNewItem: () => void
}

export function BugSuccessModal({ bugId, bugUrl, parentItemId, onNewBugSameItem, onNewItem }: BugSuccessModalProps) {
  const TOTAL_SECONDS = 10
  const [seconds, setSeconds] = useState(TOTAL_SECONDS)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-abrir o bug no Azure em nova aba ao montar
  useEffect(() => {
    window.open(bugUrl, '_blank')
  }, [bugUrl])

  // Countdown
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Quando countdown chega a 0, fecha e reseta
  useEffect(() => {
    if (seconds === 0) {
      onNewItem()
    }
  }, [seconds, onNewItem])

  const handleNewBug = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    onNewBugSameItem()
  }

  const handleNewItem = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    onNewItem()
  }

  const progress = ((TOTAL_SECONDS - seconds) / TOTAL_SECONDS) * 100

  return createPortal(
    <div className={styles.confirmOverlay}>
      <div className={styles.successModal}>

        {/* Body */}
        <div className={styles.successBody}>
          <div className={styles.successIconWrap}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="9 12 11.5 14.5 16 9" />
            </svg>
          </div>

          <h2 className={styles.successTitle}>Bug criado com sucesso!</h2>
          <p className={styles.successSubtitle}>
            O bug foi criado e vinculado ao item <strong>#{parentItemId}</strong> no Azure DevOps.
          </p>

          <div className={styles.successBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2l1.88 1.88" /><path d="M14.12 3.88L16 2" />
              <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
              <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
              <path d="M12 20v-9" /><path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
              <path d="M6 13H2" /><path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
              <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" /><path d="M22 13h-4" />
              <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
            </svg>
            <span className={styles.successBadgeId}>#{bugId}</span>
            <a
              href={bugUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.successBadgeLink}
              onClick={e => e.stopPropagation()}
            >
              Abrir no Azure
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.successFooter}>
          <p className={styles.successQuestion}>Deseja vincular outro bug ao mesmo item?</p>

          <button className={styles.btnSuccess} onClick={handleNewBug}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2l1.88 1.88" /><path d="M14.12 3.88L16 2" />
              <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
              <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
              <path d="M12 20v-9" />
            </svg>
            Sim, criar outro bug para #{parentItemId}
          </button>

          <button className={styles.btnSuccessSecondary} onClick={handleNewItem}>
            Não, buscar outro item
          </button>

          {/* Progress bar */}
          <div className={styles.successProgress}>
            <div className={styles.successProgressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.successTimer}>
            {seconds > 0 ? `Fechando em ${seconds}s...` : 'Redirecionando...'}
          </span>
        </div>

      </div>
    </div>,
    document.body
  )
}