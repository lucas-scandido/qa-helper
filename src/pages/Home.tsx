import { useNavigate } from 'react-router-dom'
import { ModuleCard } from '../components/ui/ModuleCard'
import styles from './Home.module.css'

const modules = [
  {
    id: 'bug-creation',
    title: 'Criação de Bugs',
    description: 'Crie e registre bugs de forma rápida e estruturada, vinculando automaticamente a work items relacionados.',
    accentColor: 'rgb(253, 157, 30)',
    features: ['Agilidade na criação de Bugs.'],
    locked: false,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 15V11.9375C19 9.76288 17.2371 8 15.0625 8H8.9375C6.76288 8 5 9.76288 5 11.9375V15C5 18.866 8.13401 22 12 22C15.866 22 19 18.866 19 15Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16.5 8.5V7.5C16.5 5.01472 14.4853 3 12 3C9.51472 3 7.5 5.01472 7.5 7.5V8.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M19 14H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 14H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14.5 3.5L17 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9.5 3.5L7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M20.5 20.0002L18.5 19.2002" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M20.5 7.9998L18.5 8.7998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3.5 20.0002L5.5 19.2002" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3.5 7.9998L5.5 8.7998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 21.5V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'coming-soon-1',
    title: 'Em breve',
    description: 'Novo módulo chegando em breve.',
    accentColor: 'rgb(253, 157, 30)',
    features: [],
    locked: true,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    id: 'coming-soon-2',
    title: 'Em breve',
    description: 'Novo módulo chegando em breve.',
    accentColor: 'rgb(253, 157, 30)',
    features: [],
    locked: true,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
  },
]

export function Home() {
  const navigate = useNavigate()
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className={styles.page}>

      {/* Background decoration */}
      <div className={styles.bgGrid} />
      <div className={styles.bgGlow} />

      {/* Header */}
      <header className={`${styles.header} animate-fade-up`}>
        <p className={styles.date}>{today}</p>
        <h1 className={`${styles.appTitle} font-title`}>QA Helper</h1>
        <p className={styles.appSubtitle}>Commercials</p>
        <p className={styles.subtitle}>
          Ferramenta para simplificar e automatizar operações do dia a dia, oferecendo mais controle, segurança e agilidade na gestão de testes e processos.
        </p>
      </header>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Section label */}
      <div className={`${styles.sectionLabel} animate-fade-up`} style={{ animationDelay: '0.1s' }}>
        <span className={styles.sectionLabelText}>Módulos disponíveis</span>
      </div>

      {/* Cards grid */}
      <div className={`${styles.grid} animate-fade-up`} style={{ animationDelay: '0.18s' }}>
        {modules.map(module => (
          <ModuleCard
            key={module.id}
            title={module.title}
            description={module.description}
            icon={module.icon}
            accentColor={module.accentColor}
            features={module.features}
            locked={module.locked}
            onClick={() => module.id === 'bug-creation' ? navigate('/criar-bugs') : undefined}
          />
        ))}
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.footerDot} />
        <span className={styles.footerText}>Sistema operacional — v0.1.0</span>
      </footer>
    </div>
  )
}