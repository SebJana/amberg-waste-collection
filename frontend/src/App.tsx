import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import SchedulePage from "./pages/SchedulePage/SchedulePage";
import LanguageSwitcher from "./components/LanguageSwitcher/LanguageSwitcher";
import { useTheme } from "./components/ThemeSwitcher/ThemeSwitcher";
import { useTranslation } from "react-i18next";

import { Moon, SunMedium, House } from "lucide-react";
import "./App.css";

function App() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

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
      <footer>
        {t("footer.disclaimer")}{" "}
        <a
          href={t("footer.website_link")}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("footer.website_link")}
        </a>
      </footer>
    </>
  );
}

export default App;
