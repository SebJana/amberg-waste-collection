import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SchedulePage from './pages/SchedulePage'
import LanguageSwitcher from './components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

function App() {
  const { t } = useTranslation()

  return (
    <BrowserRouter>
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/">{t('nav.home')}</Link>
          <Link to="/schedule">{t('nav.schedule')}</Link>
        </nav>
        <LanguageSwitcher />
      </header>

      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App