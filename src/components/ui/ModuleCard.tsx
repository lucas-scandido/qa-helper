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
      onClick={!locked ? onClick : undefined}
    >
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>

      <div className={styles.bottomRow}>
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

        <div className={styles.iconWrap}>
          {icon}
        </div>
      </div>
    </div>
  )
}