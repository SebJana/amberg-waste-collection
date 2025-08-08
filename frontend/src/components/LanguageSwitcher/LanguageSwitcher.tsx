import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Flag from 'react-world-flags'

function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    document.documentElement.setAttribute('lang', lng)
    localStorage.setItem('preferredLanguage', lng)
  }

  useEffect(() => {
    // Load saved language preference on mount
    const savedLanguage = localStorage.getItem('preferredLanguage')
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage)
      document.documentElement.setAttribute('lang', savedLanguage)
    } else {
      document.documentElement.setAttribute('lang', i18n.language)
    }
  }, [i18n])

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <button onClick={() => changeLanguage('de')}>
        <Flag code="DE" style={{ width: 32, height: 24 }} fallback={<span>{t('language.german')}</span>} />
      </button>

      <button onClick={() => changeLanguage('en')}>
        <Flag code="US" style={{ width: 32, height: 24 }} fallback={<span>{t('language.english')}</span>} />
      </button>
    </div>
  )
}

export default LanguageSwitcher