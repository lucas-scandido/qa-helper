import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './BugModal.module.css'

interface BugSuccessModalProps {
  bugId: number
  bugUrl: string
  onLinkNewBug: () => void
  onDismiss: () => void
}

const COUNTDOWN = 10

export function BugSuccessModal({ bugId, bugUrl, onLinkNewBug, onDismiss }: BugSuccessModalProps) {
  const [seconds, setSeconds] = useState(COUNTDOWN)

  useEffect(() => {
    if (seconds <= 0) {
      onDismiss()
      return
    }
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds, onDismiss])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onDismiss])

  const progress = (seconds / COUNTDOWN) * 100

  return createPortal(
    <div className={styles.confirmOverlay} onClick={onDismiss}>
      <div className={styles.successModal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.successHeader}>
          <div className={styles.successHeaderIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(34, 197, 94)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p className={styles.successHeaderLabel}>Bug criado com sucesso</p>
            <p className={styles.successHeaderSub}>Item #{bugId} registrado no Azure DevOps</p>
          </div>
        </div>

        {/* Body */}
        <div className={styles.successBody}>
          <a
            href={bugUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.successLinkBtn}
            onClick={e => e.stopPropagation()}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Abrir no Azure DevOps
          </a>

          <div className={styles.successDivider} />

          <p className={styles.successQuestion}>
            Deseja vincular outro bug ao mesmo card?
          </p>

          {/* Botões empilhados */}
          <div className={styles.successFooter}>
            <button className={styles.btnSuccess} onClick={onLinkNewBug}>
              Sim, vincular novo bug ao item #{bugId}
            </button>
            <button className={styles.btnSuccessGhost} onClick={onDismiss}>
              Não, buscar outro item
            </button>
          </div>

          {/* Countdown */}
          <div className={styles.successCountdownRow}>
            <div className={styles.successProgressTrack}>
              <div className={styles.successProgressBar} style={{ width: `${progress}%` }} />
            </div>
          </div>
          <p className={styles.successCountdownText}>redirecionando em {seconds}s...</p>
        </div>

      </div>
    </div>,
    document.body
  )
}
