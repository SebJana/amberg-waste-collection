import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SchedulePage from './pages/SchedulePage'
import LanguageSwitcher from './components/LanguageSwitcher/LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import { useTheme } from './components/ThemeSwitcher/ThemeSwitcher'

import { Moon, SunMedium } from 'lucide-react';

function App() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <BrowserRouter>
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/">{t('nav.home')}</Link>
          <Link to="/schedule">{t('nav.schedule')}</Link>
        </nav>
        <LanguageSwitcher />
        <div style={{ padding: "1rem" }}>
          <button onClick={toggleTheme}>
            {theme === "light" ? <Moon/> : <SunMedium/>}
          </button>
        </div>
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