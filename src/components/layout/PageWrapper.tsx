import { Sidebar } from './Sidebar'
import styles from './PageWrapper.module.css'

interface PageWrapperProps {
  children: React.ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className={styles.root}>
      <Sidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}