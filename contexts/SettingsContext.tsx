import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_COLORS, DARK_COLORS, ColorScheme } from '../constants/theme';
import translations, { Language, Translations } from '../constants/translations';

export type ThemePref = 'light' | 'dark' | 'system';

interface SettingsState {
  language: Language;
  themePref: ThemePref;
  colors: ColorScheme;
  isDark: boolean;
  t: Translations;
  setLanguage: (l: Language) => void;
  setThemePref: (t: ThemePref) => void;
}

const SettingsContext = createContext<SettingsState | null>(null);

const STORAGE_KEY = 'app_settings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [language, setLanguageState] = useState<Language>('sv');
  const [themePref, setThemePrefState] = useState<ThemePref>('system');

  // Load persisted settings on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.language) setLanguageState(parsed.language);
          if (parsed.themePref) setThemePrefState(parsed.themePref);
        } catch {}
      }
    });
  }, []);

  const persist = useCallback((lang: Language, theme: ThemePref) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ language: lang, themePref: theme }));
  }, []);

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    persist(l, themePref);
  }, [themePref, persist]);

  const setThemePref = useCallback((t: ThemePref) => {
    setThemePrefState(t);
    persist(language, t);
  }, [language, persist]);

  const effectiveTheme = themePref === 'system' ? (systemScheme ?? 'light') : themePref;
  const isDark = effectiveTheme === 'dark';
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const t = translations[language];

  return (
    <SettingsContext.Provider value={{ language, themePref, colors, isDark, t, setLanguage, setThemePref }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsState {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
