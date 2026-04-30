import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'live_rates_v1';
const API_KEY = '48d2f3f348564ab4911fd226';
// ExchangeRate-API: conversion_rates[X] = how many X per 1 USD — matches our rateToUSD field.
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

export interface CachedRates {
  date: string;            // "2026-04-30"
  rates: Record<string, number>; // code -> units per 1 USD
  fetchedAt: string;       // ISO timestamp
}

export async function fetchAndCacheRates(): Promise<CachedRates> {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`ExchangeRate-API svarade med ${response.status}`);

  const data = await response.json();
  if (data.result !== 'success') throw new Error(data['error-type'] ?? 'Okänt fel');

  // ExchangeRate-API includes USD: 1 in conversion_rates automatically
  const rates: Record<string, number> = data.conversion_rates;

  // Parse date from "Thu, 30 Apr 2026 00:00:01 +0000"
  const date = new Date(data.time_last_update_utc).toISOString().slice(0, 10);

  const cached: CachedRates = {
    date,
    rates,
    fetchedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  return cached;
}

export async function loadCachedRates(): Promise<CachedRates | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as CachedRates;
  } catch {}
  return null;
}

// Returns live rate if available, otherwise the static mock rate
export function getLiveRate(code: string, cached: CachedRates | null, mockRate: number): number {
  if (cached && cached.rates[code] !== undefined) return cached.rates[code];
  return mockRate;
}

export function formatRatesDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
