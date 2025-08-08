import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SchedulePage from './pages/SchedulePage'
import LanguageSwitcher from './components/LanguageSwitcher/LanguageSwitcher'
import { useTheme } from './components/ThemeSwitcher/ThemeSwitcher'

import { Moon, SunMedium } from 'lucide-react';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <BrowserRouter>
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
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