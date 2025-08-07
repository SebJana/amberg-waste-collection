import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './i18n/en.json'
import de from './i18n/de.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de }
  },
  lng: 'de',         // default language
  fallbackLng: 'de', // fallback language
  interpolation: {
    escapeValue: false
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
