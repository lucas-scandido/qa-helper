import styles from './BugModal.module.css'

interface BugConfirmModalProps {
  onCancel: () => void
  onConfirm: () => void
}

export function BugConfirmModal({ onCancel, onConfirm }: BugConfirmModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'fadeIn 0.15s ease both',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: 360,
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1) both',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Ícone de alerta */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '28px 28px 20px',
          gap: 12,
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'rgba(248, 113, 113, 0.12)',
            border: '1px solid rgba(248, 113, 113, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              marginBottom: 6,
            }}>
              Criar Bug
            </h2>
            <p style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}>
              Esta ação <strong style={{ color: 'var(--text-primary)' }}>não poderá ser desfeita</strong>. O bug será criado no Azure DevOps com as informações preenchidas.
            </p>
          </div>
        </div>

        {/* Ações */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '0 28px 24px',
        }}>
          <button
            className={styles.btnGhost}
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            style={{
              flex: 1,
              height: 40,
              borderRadius: 'var(--radius-sm)',
              background: '#F87171',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'IBM Plex Sans', sans-serif",
              border: 'none',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f95f5f')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F87171')}
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}