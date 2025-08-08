import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Flag from 'react-world-flags'

function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    document.documentElement.setAttribute('lang', lng)
  }

  useEffect(() => {
    // Set the initial language attribute on mount
    document.documentElement.setAttribute('lang', i18n.language)
  }, [i18n.language])

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <button onClick={() => changeLanguage('de')}>
        <Flag code="DE" style={{ width: 32, height: 24 }} fallback={<span>DE</span>} />
      </button>

      <button onClick={() => changeLanguage('en')}>
        <Flag code="US" style={{ width: 32, height: 24 }} fallback={<span>US</span>} />
      </button>
    </div>
  )
}

export default LanguageSwitcher