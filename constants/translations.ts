export type Language = 'sv' | 'en' | 'es';

export const LANGUAGE_LABELS: Record<Language, string> = {
  sv: 'Svenska',
  en: 'English',
  es: 'Español',
};

export interface Translations {
  appTitle: string;
  currenciesActive: (n: number) => string;
  addCurrency: string;
  changeCurrency: string;
  searchPlaceholder: string;
  alreadyAdded: string;
  settings: string;
  theme: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
  language: string;
  lastUpdated: string;
  mockRates: string;
  noRatesError: string;
  usingCachedRates: string;
  emptyCurrencies: string;
  emptyHint: string;
  done: string;
}

const translations: Record<Language, Translations> = {
  sv: {
    appTitle: 'Valutaomvandlare',
    currenciesActive: (n: number) => `${n} valutor aktiva`,
    addCurrency: 'Lägg till valuta',
    changeCurrency: 'Byt valuta',
    searchPlaceholder: 'Sök valuta, kod eller land...',
    alreadyAdded: 'Tillagd',
    settings: 'Inställningar',
    theme: 'Tema',
    themeLight: 'Ljust',
    themeDark: 'Mörkt',
    themeSystem: 'Systemstandard',
    language: 'Språk',
    lastUpdated: 'Uppdaterad',
    mockRates: 'Mockade kurser',
    noRatesError: 'Kunde inte hämta kurser. Kontrollera din internetuppkoppling.',
    usingCachedRates: 'Offline – visar senast sparade kurser',
    emptyCurrencies: 'Inga valutor valda',
    emptyHint: 'Tryck på + för att lägga till en valuta.',
    done: 'Klar',
  },
  en: {
    appTitle: 'Currency Converter',
    currenciesActive: (n: number) => `${n} currencies active`,
    addCurrency: 'Add currency',
    changeCurrency: 'Change currency',
    searchPlaceholder: 'Search currency, code or country...',
    alreadyAdded: 'Added',
    settings: 'Settings',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System default',
    language: 'Language',
    lastUpdated: 'Updated',
    mockRates: 'Mock rates',
    noRatesError: "Couldn't fetch rates. Check your internet connection.",
    usingCachedRates: 'Offline – showing last saved rates',
    emptyCurrencies: 'No currencies selected',
    emptyHint: 'Tap + to add a currency.',
    done: 'Done',
  },
  es: {
    appTitle: 'Conversor de divisas',
    currenciesActive: (n: number) => `${n} divisas activas`,
    addCurrency: 'Agregar divisa',
    changeCurrency: 'Cambiar divisa',
    searchPlaceholder: 'Buscar divisa, código o país...',
    alreadyAdded: 'Agregada',
    settings: 'Ajustes',
    theme: 'Tema',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    themeSystem: 'Predeterminado del sistema',
    language: 'Idioma',
    lastUpdated: 'Actualizado',
    mockRates: 'Tasas de muestra',
    noRatesError: 'No se pudieron obtener las tasas. Comprueba tu conexión.',
    usingCachedRates: 'Sin conexión – mostrando tasas guardadas',
    emptyCurrencies: 'Sin divisas seleccionadas',
    emptyHint: 'Toca + para agregar una divisa.',
    done: 'Listo',
  },
} as const;

export default translations;
