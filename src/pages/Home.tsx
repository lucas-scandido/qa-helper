import { useState, useEffect } from 'react'
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

function formatMonthYear(date: Date): string {
    return date
        .toLocaleString('pt-BR', { month: 'short', year: 'numeric' })
        .replace(' de ', '/')
        .replace(/\./g, '')
}

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

// ─── Card de estatísticas ─────────────────────────────────────────────────────

function BugStatsCard() {
    const [total, setTotal] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true)
                setError(false)
                const response = await fetch('http://localhost:3000/api/bugs/stats')
                const json = await response.json()

                if (!response.ok || !json.success) {
                    setError(true)
                    return
                }

                setTotal(json.data.total)
            } catch {
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    const now = new Date()

    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const startLabel = formatMonthYear(startOfYear)
    const endLabel = formatMonthYear(now)
    const periodLabel = `${startLabel} até ${endLabel}`

    return (
        <div className={styles.statsCard}>
            <div className={styles.statsTop}>
                <p className={styles.statsTitle}>Bugs criados por IA:</p>
                {loading ? (
                    <span className={styles.statsCount} style={{ opacity: 0.3 }}>—</span>
                ) : error ? (
                    <span className={styles.statsCount} style={{ color: 'var(--text-muted)', fontSize: 14 }}>Erro</span>
                ) : (
                    <span className={styles.statsCount}>{total}</span>
                )}
            </div>
            <div className={styles.statsFooter}>
                <span className={styles.statsPeriod}>
                    {loading ? 'Carregando...' : error ? 'Não foi possível carregar' : `Período: ${periodLabel}`}
                </span>
            </div>
        </div>
    )
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
                            Ferramenta para simplificar e automatizar operações do dia a dia, oferecendo mais controle, segurança e agilidade na gestão de testes e processos.
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