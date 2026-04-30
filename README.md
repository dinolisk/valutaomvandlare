# Valutaomvandlare

A currency converter app built with **React Native / Expo**, designed for Android (and iOS).

## Features

- **161 currencies** powered by [ExchangeRate-API](https://www.exchangerate-api.com/)
- Real-time exchange rates with offline fallback using cached rates
- Custom numpad — no system keyboard required
- Search currencies by name, code, or country
- Up to 7 active currencies displayed simultaneously
- Tap any currency to set it as the base and type a new value
- **Dark / Light / System** theme support
- **Languages**: Swedish, English, Spanish
- Persistent settings and active currencies saved locally

## Screenshots

_Coming soon_

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) on your Android/iOS device

### Install

```bash
npm install
```

### Run

```bash
npx expo start
```

Scan the QR code with Expo Go to open the app on your device.

## Tech Stack

| Tool | Purpose |
|---|---|
| React Native + Expo | Cross-platform mobile framework |
| TypeScript | Type safety |
| AsyncStorage | Local persistence (currencies, settings, rate cache) |
| ExchangeRate-API | Live exchange rates |

## Project Structure

```
├── App.tsx                   # Root component
├── components/
│   ├── CurrencyCard.tsx      # Individual currency row
│   ├── NumberPad.tsx         # Custom numeric keypad
│   ├── AddCurrencyModal.tsx  # Search & add currencies
│   └── SettingsModal.tsx     # Theme & language settings
├── hooks/
│   └── useConverter.ts       # Core conversion logic
├── services/
│   └── ratesService.ts       # API fetching & caching
├── data/
│   ├── currencies.ts         # All 161 currencies
│   └── currencyNames.ts      # Localized currency names
├── constants/
│   ├── theme.ts              # Light & dark color schemes
│   └── translations.ts       # Swedish, English, Spanish strings
└── contexts/
    └── SettingsContext.tsx   # Global theme & language state
```

## License

MIT
