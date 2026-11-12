import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { copy, localizedData, type Language } from '../data/translations';

type Theme = 'light' | 'dark';
interface Preferences {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  content: (typeof localizedData)[Language];
  ui: (typeof copy)[Language];
}

const PreferencesContext = createContext<Preferences | null>(null);
const storageKey = 'portfolio-preferences';

export function PreferencesProvider({ children }: { children: ReactNode }) {
  // Match the Spanish/light HTML during hydration before restoring saved choices.
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('es');
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
      if (saved?.theme === 'dark' || saved?.theme === 'light') setTheme(saved.theme);
      if (saved?.language === 'en' || saved?.language === 'es') setLanguage(saved.language);
    } catch {
      // Storage can be unavailable or contain stale data; defaults remain usable.
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language;
    document.title = `${localizedData[language].profile.name} · ${copy[language].titleSuffix}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', copy[language].metaDescription);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111111' : '#faf5ee');
    if (restored) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ theme, language }));
      } catch {
        // Theme and language still work when persistence is blocked.
      }
    }
  }, [theme, language, restored]);

  return (
    <PreferencesContext value={{
      theme, language,
      toggleTheme: () => setTheme((current) => current === 'light' ? 'dark' : 'light'),
      toggleLanguage: () => setLanguage((current) => current === 'es' ? 'en' : 'es'),
      content: localizedData[language], ui: copy[language],
    }}>
      {children}
    </PreferencesContext>
  );
}

export function usePreferences() {
  const preferences = useContext(PreferencesContext);
  if (!preferences) throw new Error('usePreferences must be used within PreferencesProvider');
  return preferences;
}
