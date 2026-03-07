import { NavLink } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { BugIcon } from '../ui/BugIcon'
import styles from './Sidebar.module.css'

const navItems = [
  {
    label: 'Início',
    path: '/',
    end: true,
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
    end: false,
    icon: <BugIcon size={20} />,
  },
]

export function Sidebar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <aside className={styles.sidebar}>
      {/* Nav */}
      <nav className={styles.nav}>
        {navItems.map(item => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            {item.icon}
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.spacer} />

      {/* Theme toggle */}
      <button className={styles.themeToggle} onClick={toggleTheme} title="Alternar tema" aria-label="Alternar tema">
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
