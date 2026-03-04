import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Home } from '../pages/Home'
import { BugCreation } from '../modules/bug-creation/BugCreation'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <PageWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/criar-bugs" element={<BugCreation />} />
        </Routes>
      </PageWrapper>
    </BrowserRouter>
  )
}