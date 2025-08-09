import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage/HomePage'
import SchedulePage from './pages/SchedulePage/SchedulePage'
import LanguageSwitcher from './components/LanguageSwitcher/LanguageSwitcher'
import { useTheme } from './components/ThemeSwitcher/ThemeSwitcher'

import { Moon, SunMedium, House } from 'lucide-react';
import './App.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <>
      <header className="header">
        <div className="header-left">
          {!isHome && (
            <button className="theme-toggle" onClick={() => navigate("/")}>
              <House />
            </button>
          )}
        </div>

        <div className="header-right">
          <LanguageSwitcher />
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? <Moon /> : <SunMedium />}
          </button>
        </div>
      </header>

      <main className="main-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/schedule/:zoneCode" element={<SchedulePage />} />
        </Routes>
      </main>
    </>
  )
}

export default App