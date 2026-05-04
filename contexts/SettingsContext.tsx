import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { LIGHT_COLORS, DARK_COLORS, ColorScheme } from '../constants/theme';
import translations, { Language, Translations } from '../constants/translations';

function detectLanguage(): Language {
  const code = Localization.getLocales()[0]?.languageCode ?? 'en';
  if (code === 'sv') return 'sv';
  if (code === 'es') return 'es';
  return 'en';
}

export type ThemePref = 'light' | 'dark' | 'system';

interface SettingsState {
  language: Language;
  themePref: ThemePref;
  colors: ColorScheme;
  isDark: boolean;
  t: Translations;
  onboardingDone: boolean;
  setLanguage: (l: Language) => void;
  setThemePref: (t: ThemePref) => void;
  completeOnboarding: (themePref: ThemePref) => void;
}

const SettingsContext = createContext<SettingsState | null>(null);

const STORAGE_KEY = 'app_settings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [language, setLanguageState] = useState<Language>(detectLanguage);
  const [themePref, setThemePrefState] = useState<ThemePref>('system');
  const [onboardingDone, setOnboardingDone] = useState(false);

  // Load persisted settings on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.language) setLanguageState(parsed.language);
          if (parsed.themePref) setThemePrefState(parsed.themePref);
          if (parsed.onboardingDone) setOnboardingDone(true);
        } catch {}
      }
    });
  }, []);

  const persist = useCallback((lang: Language, theme: ThemePref, obDone = onboardingDone) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ language: lang, themePref: theme, onboardingDone: obDone }));
  }, [onboardingDone]);

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    persist(l, themePref);
  }, [themePref, persist]);

  const setThemePref = useCallback((t: ThemePref) => {
    setThemePrefState(t);
    persist(language, t);
  }, [language, persist]);

  const completeOnboarding = useCallback((chosenTheme: ThemePref) => {
    setThemePrefState(chosenTheme);
    setOnboardingDone(true);
    persist(language, chosenTheme, true);
  }, [language, persist]);

  const effectiveTheme = themePref === 'system' ? (systemScheme ?? 'light') : themePref;
  const isDark = effectiveTheme === 'dark';
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const t = translations[language];

  return (
    <SettingsContext.Provider value={{ language, themePref, colors, isDark, t, onboardingDone, setLanguage, setThemePref, completeOnboarding }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsState {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
