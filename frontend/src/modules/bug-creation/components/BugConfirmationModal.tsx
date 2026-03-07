import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './BugModal.module.css'

interface BugConfirmationModalProps {
  onCancel: () => void
  onConfirm: () => void
}

export function BugConfirmationModal({ onCancel, onConfirm }: BugConfirmationModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return createPortal(
    <div className={styles.confirmOverlay} onClick={onCancel}>
      <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>

        <div className={styles.confirmBody}>
          <div className={styles.confirmIconWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(253, 157, 30)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <div className={styles.confirmText}>
            <h2 className={styles.confirmTitle}>Criar Bug</h2>
            <p className={styles.confirmDescription}>
              Esta ação{' '}
              <strong style={{ color: 'var(--text-primary)' }}>não poderá ser desfeita</strong>.
              {' '}O bug será criado no Azure DevOps com as informações preenchidas.
            </p>
          </div>
        </div>

        <div className={styles.confirmActions}>
          <button
            className={styles.btnGhost}
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button className={styles.btnDanger} onClick={onConfirm}>
            Confirmar
          </button>
        </div>

      </div>
    </div>,
    document.body
  )
}