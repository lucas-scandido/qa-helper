import styles from './ModuleCard.module.css'

interface ModuleCardProps {
  title: string
  description: string
  icon: React.ReactNode
  accentColor: string
  features?: string[]
  locked?: boolean
  onClick?: () => void
}

export function ModuleCard({
  title,
  description,
  icon,
  accentColor,
  features = [],
  locked = false,
  onClick,
}: ModuleCardProps) {
  return (
    <div
      className={`${styles.card} ${locked ? styles.locked : ''}`}
      style={{
        '--card-accent': accentColor,
        '--card-accent-dim': accentColor.replace(')', ', 0.10)').replace('rgb', 'rgba'),
        '--card-accent-border': accentColor.replace(')', ', 0.25)').replace('rgb', 'rgba'),
      } as React.CSSProperties}
    >
      {/* ── Header: icon + title ── */}
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          {icon}
        </div>
        <h3 className={styles.title}>{title}</h3>
      </div>

      {/* ── Description ── */}
      <p className={styles.description}>{description}</p>

      {/* ── Features ── */}
      <ul className={styles.features}>
        {features.map((f, i) => (
          <li key={i} className={styles.featureItem}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.featureCheck}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      {/* ── Footer: botão ── */}
      <div className={styles.footer}>
        <button
          className={`${styles.btn} ${locked ? styles.btnLocked : ''}`}
          onClick={!locked ? onClick : undefined}
          disabled={locked}
        >
          {locked ? 'Em breve' : 'Acessar módulo'}
          {!locked && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}