export interface ColorScheme {
  background: string;
  card: string;
  cardFocused: string;
  border: string;
  accent: string;
  accentLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  removeBg: string;
  modalBg: string;
  searchBg: string;
  separator: string;
  danger: string;
}

export const LIGHT_COLORS: ColorScheme = {
  background: '#FFF0EB',
  card: '#FFFFFF',
  cardFocused: '#FFF5F2',
  border: '#FFD9CC',
  accent: '#FF6B4A',
  accentLight: '#FF9880',
  textPrimary: '#1A1016',
  textSecondary: '#6B5A55',
  textMuted: '#B8A09A',
  removeBg: '#FFE8E2',
  modalBg: '#FFFFFF',
  searchBg: '#FFF5F2',
  separator: '#FFE0D5',
  danger: '#E74C3C',
};

export const DARK_COLORS: ColorScheme = {
  background: '#0D0D1A',
  card: '#16162A',
  cardFocused: '#1E1E38',
  border: '#2E2E50',
  accent: '#FF6B4A',
  accentLight: '#FF9880',
  textPrimary: '#F0EFFF',
  textSecondary: '#9A98C0',
  textMuted: '#4A4870',
  removeBg: '#252545',
  modalBg: '#12121F',
  searchBg: '#1A1A30',
  separator: '#1E1E35',
  danger: '#FF5C5C',
};

// Legacy export for components not yet migrated
export const COLORS = LIGHT_COLORS;
