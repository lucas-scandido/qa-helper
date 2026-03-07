import { ThemeProvider } from './store/ThemeProvider'
import { AppRoutes } from './routes'
import { ErrorBoundary } from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </ErrorBoundary>
  )
}