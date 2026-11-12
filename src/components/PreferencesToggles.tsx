import { usePreferences } from '../context/PreferencesContext';

export default function PreferencesToggles() {
  const { theme, language, toggleTheme, toggleLanguage, ui } = usePreferences();
  return (
    <div className="site-header__controls">
      <button id="theme-toggle" className="toggle" type="button" role="switch" aria-checked={theme === 'dark'} aria-label={ui.darkMode} onClick={toggleTheme}>
        <span aria-hidden="true">☀</span>
        <span className="toggle__track" aria-hidden="true"><span className="toggle__thumb" /></span>
        <span aria-hidden="true">☾</span>
      </button>
      <button id="language-toggle" className="toggle" type="button" role="switch" aria-checked={language === 'en'} aria-label={ui.englishLanguage} onClick={toggleLanguage}>
        <span aria-hidden="true">ES</span>
        <span className="toggle__track" aria-hidden="true"><span className="toggle__thumb" /></span>
        <span aria-hidden="true">EN</span>
      </button>
    </div>
  );
}
