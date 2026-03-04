import { ThemeProvider } from './store/ThemeProvider'
import { AppRoutes } from './routes'

export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  )
}