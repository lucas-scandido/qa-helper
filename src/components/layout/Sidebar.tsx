import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import styles from './Sidebar.module.css'

const navItems = [
  {
    label: 'Início',
    path: '/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Criar Bugs',
    path: '/criar-bugs',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 15V11.9375C19 9.76288 17.2371 8 15.0625 8H8.9375C6.76288 8 5 9.76288 5 11.9375V15C5 18.866 8.13401 22 12 22C15.866 22 19 18.866 19 15Z"/>
        <path d="M16.5 8.5V7.5C16.5 5.01472 14.4853 3 12 3C9.51472 3 7.5 5.01472 7.5 7.5V8.5"/>
        <path d="M19 14H22"/>
        <path d="M5 14H2"/>
        <path d="M14.5 3.5L17 2"/>
        <path d="M9.5 3.5L7 2"/>
        <path d="M20.5 20.0002L18.5 19.2002"/>
        <path d="M20.5 7.9998L18.5 8.7998"/>
        <path d="M3.5 20.0002L5.5 19.2002"/>
        <path d="M3.5 7.9998L5.5 8.7998"/>
        <path d="M12 21.5V15"/>
      </svg>
    ),
  }
]

export function Sidebar() {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside className={styles.sidebar}>
      {/* Nav */}
      <nav className={styles.nav}>
        {navItems.map(item => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path)

          return (
            <button
              key={item.label}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className={styles.spacer} />

      {/* Theme toggle */}
      <button className={styles.themeToggle} onClick={toggleTheme} title="Alternar tema">
        {theme === 'dark' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      {/* Status + versão */}
      <div className={styles.sidebarFooter}>
        <span className={styles.statusDot} />
        <span className={styles.versionText}>v0.1.0</span>
      </div>
    </aside>
  )
}