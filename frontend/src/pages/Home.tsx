import { useNavigate } from 'react-router-dom'
import { ModuleCard } from '../components/ui/ModuleCard'
import { BugStatsCard } from '../components/ui/BugStatsCard'
import { BugIcon } from '../components/ui/BugIcon'
import styles from './Home.module.css'

const modules = [
    {
        id: 'bug-creation',
        title: 'Criação de Bugs',
        description: 'Crie e registre bugs de forma rápida e estruturada, vinculando automaticamente a work items relacionados.',
        accentColor: 'rgb(253, 157, 30)',
        features: ['Agilidade na criação de Bugs.'],
        locked: false,
        icon: <BugIcon size={26} />,
    },
    {
        id: 'create-task-and-mission',
        title: 'Criação de Tarefas/Missões',
        description: 'Crie tarefas e missões de forma eficiente, diversificando tipos e categorias.',
        accentColor: 'rgb(253, 157, 30)',
        features: ['Agilidade na criação de massa de dados.'],
        locked: true,
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
        ),
    },
    {
        id: 'test-case-management',
        title: 'Gestão de Test Cases',
        description: 'Gerencie Test Cases de Work Items fechados, identificando pendências e realizando ajustes em massa.',
        accentColor: 'rgb(253, 157, 30)',
        features: ['Identificação rápida de Test Cases em aberto.'],
        locked: true,
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
        ),
    },
]

// ─── Helpers de data ──────────────────────────────────────────────────────────

function formatFullDate(date: Date): string {
    return date
        .toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        .replace(/^\w/, c => c.toUpperCase())
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function Home() {
    const navigate = useNavigate()

    return (
        <div className={styles.page}>
            <div className={styles.layout}>

                <aside className={`${styles.aside} animate-fade-up`}>
                    <div className={styles.asideHeader}>
                        <h1 className={`${styles.appTitle} font-title`}>QA Helper</h1>
                        <p className={styles.appSubtitle}>Commercials</p>
                        <div className={styles.divider} />
                        <p className={styles.subtitle}>
                            Simplifique e automatize operações do dia a dia. Tenha mais agilidade, controle e segurança na gestão de testes e processos.
                        </p>
                    </div>

                    <BugStatsCard />
                </aside>

                <div className={styles.separator} />

                <section className={styles.content}>
                    <div className={styles.contentSpacer}>
                        <div className={`${styles.pageLabel} animate-fade-up`}>
                            <span className={styles.pageLabelText}>Início</span>
                            <p className={styles.pageLabelDate}>{formatFullDate(new Date())}</p>
                        </div>
                    </div>

                    <div className={`${styles.sectionLabel} animate-fade-up`}>
                        <span className={styles.sectionLabelText}>Módulos disponíveis</span>
                        <div className={styles.sectionLabelLine} />
                    </div>

                    <div className={`${styles.grid} animate-fade-up`} style={{ animationDelay: '0.1s' }}>
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
                </section>

            </div>
        </div>
    )
}