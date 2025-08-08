import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage/HomePage'
import SchedulePage from './pages/SchedulePage/SchedulePage'
import LanguageSwitcher from './components/LanguageSwitcher/LanguageSwitcher'
import { useTheme } from './components/ThemeSwitcher/ThemeSwitcher'

import { Moon, SunMedium } from 'lucide-react';
import './App.css';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <BrowserRouter>
      <header className="header">
        <LanguageSwitcher />
        <div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? <Moon/> : <SunMedium/>}
          </button>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/schedule/:zoneCode" element={<SchedulePage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App