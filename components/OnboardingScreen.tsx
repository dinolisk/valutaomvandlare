import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Modal,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../contexts/SettingsContext';
import { ThemePref } from '../contexts/SettingsContext';
import { ColorScheme } from '../constants/theme';
import { getFlagUrl, ALL_CURRENCIES, Currency, MAX_CURRENCIES } from '../data/currencies';
import { getLocalizedName } from '../data/currencyNames';

const SUGGESTED_CODES = [
  'SEK', 'EUR', 'USD', 'GBP', 'NOK', 'DKK', 'CHF', 'JPY', 'AUD', 'CAD', 'NZD', 'PLN',
];

const THEME_OPTIONS: { value: ThemePref; icon: string; label: string; sub: string }[] = [
  { value: 'light',  icon: '☀️', label: 'Light',          sub: 'Clean and bright' },
  { value: 'dark',   icon: '🌙', label: 'Dark',           sub: 'Easy on the eyes' },
  { value: 'system', icon: '⚙️', label: 'System default', sub: 'Follows your device' },
];

const MIN_SELECTED = 2;
/** Width (dp) at or above: use 4 columns; below: phone layout with 3 columns max */
const TABLET_MIN_WIDTH = 768;

interface Props {
  onDone: (currencies: string[], theme: ThemePref) => void;
}

export default function OnboardingScreen({ onDone }: Props) {
  const { colors, language } = useSettings();
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= TABLET_MIN_WIDTH;
  const numCols = isTablet ? 4 : 3;
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<string[]>(['SEK', 'EUR']);
  const [selectedTheme, setSelectedTheme] = useState<ThemePref>('system');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const suggestedCurrencies = useMemo(
    () =>
      SUGGESTED_CODES.map((code) => ALL_CURRENCIES.find((c) => c.code === code)).filter(
        (c): c is Currency => c != null
      ),
    []
  );

  const gridRows = useMemo(() => {
    const rows: Currency[][] = [];
    for (let i = 0; i < suggestedCurrencies.length; i += numCols) {
      rows.push(suggestedCurrencies.slice(i, i + numCols));
    }
    return rows;
  }, [suggestedCurrencies, numCols]);

  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return ALL_CURRENCIES;
    return ALL_CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        getLocalizedName(c.code, language, c.name).toLowerCase().includes(q)
    );
  }, [searchQuery, language]);

  const toggleCurrency = (code: string) => {
    setSelected((prev) => {
      if (prev.includes(code)) return prev.filter((c) => c !== code);
      if (prev.length >= MAX_CURRENCIES) return prev;
      return [...prev, code];
    });
  };

  const handleContinue = () => setStep(2);
  const handleDone = () => onDone(selected, selectedTheme);

  const canContinue = selected.length >= MIN_SELECTED;
  const atMax = selected.length >= MAX_CURRENCIES;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Step indicators */}
      <View style={styles.stepRow}>
        <View style={[styles.stepDot, step === 1 && styles.stepDotActive]} />
        <View style={[styles.stepDot, step === 2 && styles.stepDotActive]} />
      </View>

      {step === 1 ? (
        <View style={styles.step1Container}>
          {/* Fixed header — always visible */}
          <View style={styles.step1Header}>
            {/* Newest selection aligns right; overflow clips on the left */}
            {selected.length > 0 && (
              <View style={styles.selectedStrip}>
                <View style={styles.selectedStripRow}>
                  {selected.map((code) => {
                    const c = ALL_CURRENCIES.find((x) => x.code === code);
                    if (!c) return null;
                    return (
                      <TouchableOpacity
                        key={code}
                        onPress={() => toggleCurrency(code)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
                      >
                        <View style={styles.stripFlagRing}>
                          <Image
                            source={{ uri: getFlagUrl(c.countryCode) }}
                            style={styles.stripFlag}
                            resizeMode="cover"
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <Text style={styles.title}>Choose your currencies</Text>
            <Text style={styles.subtitle}>
              Select 2–{MAX_CURRENCIES} to get started.{atMax ? ` Max ${MAX_CURRENCIES} reached.` : ''}
            </Text>

            {/* Inline search input — always visible */}
            <TouchableOpacity
              style={styles.searchBarBtn}
              onPress={() => setShowSearch(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.searchBarIcon}>🔍</Text>
              <Text style={styles.searchBarPlaceholder}>Search all 161 currencies...</Text>
            </TouchableOpacity>
          </View>

          {/* Grid — 12 tiles: 3×4 on phones, 4×3 on tablets (≥768dp) */}
          <View style={styles.step1GridArea}>
            {gridRows.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.gridRow}>
                {row.map((c) => {
                  const active = selected.includes(c.code);
                  const disabled = atMax && !active;
                  return (
                    <View key={c.code} style={styles.cardCol}>
                      <TouchableOpacity
                        style={[styles.currencyCard, active && styles.currencyCardActive, disabled && styles.currencyCardDisabled]}
                        onPress={() => toggleCurrency(c.code)}
                        activeOpacity={disabled ? 1 : 0.7}
                      >
                        <View style={styles.flagWrap}>
                          <Image
                            source={{ uri: getFlagUrl(c.countryCode) }}
                            style={styles.flag}
                            resizeMode="cover"
                          />
                        </View>
                        <Text style={[styles.currencyCode, active && styles.currencyCodeActive]}>{c.code}</Text>
                        <Text style={styles.currencyName} numberOfLines={1}>
                          {getLocalizedName(c.code, language, c.name)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>Choose your theme</Text>
          <Text style={styles.subtitle}>
            Pick how you'd like the app to look. You can change this later in Settings.
          </Text>
          <View style={styles.themeList}>
            {THEME_OPTIONS.map((opt) => {
              const active = selectedTheme === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.themeCard, active && styles.themeCardActive]}
                  onPress={() => setSelectedTheme(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.themeIcon}>{opt.icon}</Text>
                  <View style={styles.themeLabels}>
                    <Text style={[styles.themeLabel, active && styles.themeLabelActive]}>{opt.label}</Text>
                    <Text style={styles.themeSub}>{opt.sub}</Text>
                  </View>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        {step === 2 && (
          <TouchableOpacity onPress={() => setStep(1)} activeOpacity={0.7} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.primaryBtn, !canContinue && step === 1 && styles.primaryBtnDisabled]}
          onPress={step === 1 ? handleContinue : handleDone}
          activeOpacity={0.85}
          disabled={step === 1 && !canContinue}
        >
          <Text style={styles.primaryBtnText}>
            {step === 1
              ? canContinue
                ? `Continue (${selected.length} selected)`
                : `Select at least ${MIN_SELECTED}`
              : 'Get Started'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search modal */}
      <Modal visible={showSearch} animationType="slide" transparent onRequestClose={() => setShowSearch(false)}>
        <View style={styles.searchOverlay}>
          <SafeAreaView style={styles.searchSheet}>
            <View style={styles.searchHandle} />
            <View style={styles.searchHeader}>
              <Text style={styles.searchTitle}>Search currencies</Text>
              <TouchableOpacity
                style={styles.searchCloseBtn}
                onPress={() => { setShowSearch(false); setSearchQuery(''); }}
              >
                <Text style={styles.searchCloseTxt}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.searchInputRow}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Currency, code or country..."
                placeholderTextColor={colors.textMuted}
                autoFocus
                autoCorrect={false}
                autoCapitalize="characters"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.searchClearTxt}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => {
                const active = selected.includes(item.code);
                const disabled = atMax && !active;
                return (
                  <TouchableOpacity
                    style={[styles.searchItem, disabled && styles.searchItemDisabled]}
                    onPress={() => toggleCurrency(item.code)}
                    activeOpacity={disabled ? 1 : 0.7}
                  >
                    <View style={styles.searchFlagWrap}>
                      <Image
                        source={{ uri: getFlagUrl(item.countryCode) }}
                        style={styles.searchFlag}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.searchLabels}>
                      <Text style={styles.searchCode}>{item.code}</Text>
                      <Text style={styles.searchName}>{getLocalizedName(item.code, language, item.name)}</Text>
                      <Text style={styles.searchCountry}>{item.country}</Text>
                    </View>
                    <View style={[styles.searchCheckCircle, active && styles.searchCheckCircleActive]}>
                      {active && <Text style={styles.searchCheckTxt}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.searchSep} />}
              contentContainerStyle={{ paddingBottom: 32 }}
              keyboardShouldPersistTaps="handled"
            />
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function makeStyles(colors: ColorScheme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    stepRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 6, paddingBottom: 2 },
    stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
    stepDotActive: { width: 24, backgroundColor: colors.accent },
    content: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },

    // Step 1 layout
    step1Container: { flex: 1 },
    step1Header: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 4 },

    selectedStrip: {
      width: '100%',
      height: 40,
      marginBottom: 8,
      overflow: 'hidden',
      position: 'relative',
    },
    selectedStripRow: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'nowrap',
      gap: 6,
    },
    stripFlagRing: {
      width: 34,
      height: 34,
      borderRadius: 17,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: colors.accent,
      backgroundColor: colors.searchBg,
    },
    // Fill inner layout box (inside border) so cover-crop matches the circular clip — avoids off-center look vs grid
    stripFlag: {
      width: '100%',
      height: '100%',
    },

    title: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
    subtitle: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 8 },

    // Inline search bar button
    searchBarBtn: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.card, borderRadius: 14,
      borderWidth: 1.5, borderColor: colors.border,
      paddingHorizontal: 14, paddingVertical: 10,
      marginBottom: 6, gap: 8,
    },
    searchBarIcon: { fontSize: 16 },
    searchBarPlaceholder: { flex: 1, fontSize: 14, color: colors.textMuted },

    step1GridArea: { flex: 1, paddingHorizontal: 12, paddingBottom: 4 },
    gridRow: { flex: 1, flexDirection: 'row' },
    cardCol: { flex: 1, padding: 4 },
    currencyCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 2,
    },
    currencyCardActive: { borderColor: colors.accent, backgroundColor: colors.cardFocused },
    currencyCardDisabled: { opacity: 0.35 },
    flagWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      overflow: 'hidden',
      marginBottom: 6,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.12)',
    },
    flag: { width: '100%', height: '100%' },
    currencyCode: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
    currencyCodeActive: { color: colors.accent },
    currencyName: { fontSize: 9, color: colors.textMuted, marginTop: 1, textAlign: 'center' },

    themeList: { gap: 12 },
    themeCard: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
      borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, padding: 18, gap: 14,
    },
    themeCardActive: { borderColor: colors.accent, backgroundColor: colors.cardFocused },
    themeIcon: { fontSize: 28 },
    themeLabels: { flex: 1 },
    themeLabel: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
    themeLabelActive: { color: colors.accent },
    themeSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    radioActive: { borderColor: colors.accent },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },

    footer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20, gap: 12 },
    backBtn: { paddingVertical: 16, paddingHorizontal: 4 },
    backBtnText: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
    primaryBtn: { flex: 1, backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    primaryBtnDisabled: { backgroundColor: colors.border },
    primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

    // Search modal
    searchOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
    searchSheet: { backgroundColor: colors.modalBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
    searchHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
    searchHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
    searchTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
    searchCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.searchBg, alignItems: 'center', justifyContent: 'center' },
    searchCloseTxt: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
    searchInputRow: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: colors.searchBg,
      marginHorizontal: 16, marginBottom: 8, borderRadius: 12, paddingHorizontal: 12,
      borderWidth: 1, borderColor: colors.border,
    },
    searchIcon: { fontSize: 16, marginRight: 8 },
    searchInput: { flex: 1, color: colors.textPrimary, fontSize: 15, paddingVertical: 12 },
    searchClearTxt: { color: colors.textMuted, fontSize: 12, padding: 4 },
    searchItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
    searchFlagWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      overflow: 'hidden',
      marginRight: 12,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.12)',
    },
    searchFlag: { width: 40, height: 40 },
    searchLabels: { flex: 1 },
    searchCode: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
    searchName: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
    searchCountry: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
    searchCheckCircle: {
      width: 28, height: 28, borderRadius: 14, borderWidth: 2,
      borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
    },
    searchCheckCircleActive: { backgroundColor: colors.accent, borderColor: colors.accent },
    searchCheckTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
    searchItemDisabled: { opacity: 0.35 },
    searchSep: { height: 1, backgroundColor: colors.separator, marginHorizontal: 16 },
  });
}
