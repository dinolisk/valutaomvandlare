import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_CURRENCIES,
  DEFAULT_BASE_CURRENCY,
  getCurrency,
} from '../data/currencies';
import {
  CachedRates,
  fetchAndCacheRates,
  loadCachedRates,
  getLiveRate,
} from '../services/ratesService';

const STORAGE_KEY = 'active_currencies';
const MAX_DIGITS = 12;

async function loadSavedCurrencies(): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_CURRENCIES;
}

async function saveCurrencies(codes: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
  } catch {}
}

function formatResult(n: number): string {
  if (n === 0) return '0';
  if (n >= 1_000) return n.toLocaleString('sv-SE', { maximumFractionDigits: 0 });
  return n.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatInputDisplay(s: string): string {
  const [intPart, decPart] = s.split(',');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  return decPart !== undefined ? `${formattedInt},${decPart}` : formattedInt;
}

function toInputString(n: number): string {
  if (n === 0) return '0';
  const decimals = n >= 1000 ? 0 : 4;
  let s = n.toFixed(decimals).replace('.', ',');
  if (s.includes(',')) {
    s = s.replace(/0+$/, '').replace(/,$/, '');
  }
  return s || '0';
}

export function useConverter() {
  const [activeCodes, setActiveCodes] = useState<string[]>(DEFAULT_CURRENCIES);
  const [baseCode, setBaseCode] = useState<string>(DEFAULT_BASE_CURRENCY);
  const [inputString, setInputString] = useState<string>('1');
  const [pendingReplace, setPendingReplace] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Rates state
  const [cachedRates, setCachedRates] = useState<CachedRates | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ratesError, setRatesError] = useState(false);
  const [startedOffline, setStartedOffline] = useState(false);

  // Load currencies + cached rates, then fetch fresh rates
  useEffect(() => {
    Promise.all([loadSavedCurrencies(), loadCachedRates()]).then(
      ([codes, rates]) => {
        setActiveCodes(codes);
        if (!codes.includes(DEFAULT_BASE_CURRENCY)) {
          setBaseCode(codes[0] ?? DEFAULT_BASE_CURRENCY);
        }
        setCachedRates(rates);
        setLoaded(true);
      }
    );

    // Fetch fresh rates in background; if it fails, mark as started offline
    fetchAndCacheRates()
      .then((fresh) => {
        setCachedRates(fresh);
        setStartedOffline(false);
      })
      .catch(() => {
        setStartedOffline(true);
      });
  }, []);

  useEffect(() => {
    if (loaded) saveCurrencies(activeCodes);
  }, [activeCodes, loaded]);

  const refreshRates = useCallback(async () => {
    setIsRefreshing(true);
    setRatesError(null);
    try {
      const fresh = await fetchAndCacheRates();
      setCachedRates(fresh);
      setRatesError(false);
      setStartedOffline(false);
    } catch {
      setRatesError(true);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Get the effective rate for a currency (live if available, else mock)
  const getRate = useCallback(
    (code: string): number => {
      const currency = getCurrency(code);
      if (!currency) return 1;
      return getLiveRate(code, cachedRates, currency.rateToUSD);
    },
    [cachedRates]
  );

  const baseAmount = parseFloat(inputString.replace(',', '.')) || 0;

  const getDisplayValue = useCallback(
    (code: string): string => {
      if (code === baseCode) return formatInputDisplay(inputString);
      if (baseAmount === 0) return '0';
      const baseRate = getRate(baseCode);
      const targetRate = getRate(code);
      if (baseRate === 0) return '0';
      return formatResult((baseAmount / baseRate) * targetRate);
    },
    [baseCode, inputString, baseAmount, getRate]
  );

  const activateCurrency = useCallback(
    (code: string) => {
      if (code === baseCode) {
        setPendingReplace(true);
        return;
      }
      const baseRate = getRate(baseCode);
      const targetRate = getRate(code);
      const result = baseAmount === 0 || baseRate === 0 ? 0 : (baseAmount / baseRate) * targetRate;
      setBaseCode(code);
      setInputString(toInputString(result));
      setPendingReplace(true);
    },
    [baseCode, baseAmount, getRate]
  );

  const replaceSlotCurrency = useCallback(
    (oldCode: string, newCode: string) => {
      if (oldCode === newCode) return;
      setActiveCodes((prev) => prev.map((c) => (c === oldCode ? newCode : c)));
      if (baseCode === oldCode) setBaseCode(newCode);
    },
    [baseCode]
  );

  const appendDigit = useCallback(
    (digit: string) => {
      if (pendingReplace) {
        setPendingReplace(false);
        setInputString(digit === ',' ? '0,' : digit);
        return;
      }
      setInputString((prev) => {
        if (digit === ',') return prev.includes(',') ? prev : prev + ',';
        const digitCount = prev.replace(',', '').length;
        if (digitCount >= MAX_DIGITS) return prev;
        if (prev === '0') return digit;
        return prev + digit;
      });
    },
    [pendingReplace]
  );

  const deleteDigit = useCallback(() => {
    if (pendingReplace) {
      setPendingReplace(false);
      setInputString('0');
      return;
    }
    setInputString((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
  }, [pendingReplace]);

  const clearInput = useCallback(() => {
    setInputString('0');
    setPendingReplace(false);
  }, []);

  const addCurrency = useCallback((code: string) => {
    setActiveCodes((prev) => (prev.includes(code) ? prev : [...prev, code]));
  }, []);

  const removeCurrency = useCallback(
    (code: string) => {
      setActiveCodes((prev) => prev.filter((c) => c !== code));
      if (baseCode === code) {
        const remaining = activeCodes.filter((c) => c !== code);
        setBaseCode(remaining[0] ?? DEFAULT_BASE_CURRENCY);
        setInputString('1');
      }
    },
    [activeCodes, baseCode]
  );

  return {
    activeCodes,
    baseCode,
    loaded,
    pendingReplace,
    cachedRates,
    isRefreshing,
    ratesError,
    startedOffline,
    getDisplayValue,
    refreshRates,
    activateCurrency,
    replaceSlotCurrency,
    appendDigit,
    deleteDigit,
    clearInput,
    addCurrency,
    removeCurrency,
  };
}
