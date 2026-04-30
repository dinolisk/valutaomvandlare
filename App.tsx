import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useConverter } from './hooks/useConverter';
import { getCurrency, MAX_CURRENCIES } from './data/currencies';
import CurrencyCard from './components/CurrencyCard';
import AddCurrencyModal from './components/AddCurrencyModal';
import NumberPad from './components/NumberPad';
import SettingsModal from './components/SettingsModal';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { ColorScheme } from './constants/theme';

function AppContent() {
  const { colors, isDark, t } = useSettings();
  const styles = makeStyles(colors);

  const [isEditMode, setIsEditMode] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const {
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
  } = useConverter();

  // Spinning animation for the reload button
  const spinAnim = useRef(new Animated.Value(0)).current;
  const spinLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isRefreshing) {
      spinLoop.current = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: Platform.OS !== 'web',
        })
      );
      spinLoop.current.start();
    } else {
      spinLoop.current?.stop();
      spinAnim.setValue(0);
    }
  }, [isRefreshing, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleModalSelect = (code: string) => {
    if (modalMode === 'add') addCurrency(code);
    else if (modalMode !== null) replaceSlotCurrency(modalMode, code);
    setModalMode(null);
  };

  const occupiedInModal =
    modalMode === 'add'
      ? activeCodes
      : activeCodes.filter((c) => c !== modalMode);

  const [listHeight, setListHeight] = useState(0);
  const onListLayout = useCallback(
    (e: { nativeEvent: { layout: { height: number } } }) => {
      setListHeight(e.nativeEvent.layout.height);
    },
    []
  );
  const CARD_GAP = 6;
  const MAX_CARD_HEIGHT =
    listHeight > 0 ? Math.floor((listHeight - 5 * CARD_GAP) / 5) : 110;

  const lastUpdatedText = cachedRates
    ? `${t.lastUpdated}: ${new Date(cachedRates.fetchedAt).toLocaleString('sv-SE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`
    : null;

  if (!loaded) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
        <ActivityIndicator style={{ flex: 1 }} color={colors.accent} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{t.appTitle}</Text>
          <Text style={styles.headerSub}>
            {t.currenciesActive(activeCodes.length)}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {/* Reload button */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={refreshRates}
            disabled={isRefreshing}
            activeOpacity={0.7}
          >
            <Animated.Text
              style={[styles.iconBtnText, { transform: [{ rotate: spin }] }]}
            >
              ↻
            </Animated.Text>
          </TouchableOpacity>

          {/* Edit (remove) mode toggle */}
          <TouchableOpacity
            style={[styles.iconBtn, isEditMode && styles.iconBtnActive]}
            onPress={() => setIsEditMode((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={[styles.iconBtnText, isEditMode && styles.iconBtnTextActive]}>
              −
            </Text>
          </TouchableOpacity>

          {/* Add currency */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              styles.iconBtnAccent,
              activeCodes.length >= MAX_CURRENCIES && styles.iconBtnDisabled,
            ]}
            onPress={() => activeCodes.length < MAX_CURRENCIES && setModalMode('add')}
            activeOpacity={activeCodes.length >= MAX_CURRENCIES ? 1 : 0.8}
          >
            <Text style={[styles.iconBtnText, styles.iconBtnTextAccent]}>+</Text>
          </TouchableOpacity>

          {/* Settings button — far right */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowSettings(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.iconBtnText}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error banner – shown when manual refresh fails */}
      {ratesError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{t.noRatesError}</Text>
        </View>
      )}

      {/* Offline banner – started without internet, using cached/mock rates */}
      {!ratesError && startedOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>{t.usingCachedRates}</Text>
        </View>
      )}

      <View style={styles.divider} />

      {/* Currency list */}
      <View style={styles.cardList} onLayout={onListLayout}>
        {activeCodes.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>💸</Text>
            <Text style={styles.emptyText}>{t.emptyCurrencies}</Text>
            <Text style={styles.emptyHint}>{t.emptyHint}</Text>
          </View>
        ) : (
          activeCodes.map((code) => {
            const currency = getCurrency(code);
            if (!currency) return null;
            return (
              <CurrencyCard
                key={code}
                currency={currency}
                value={getDisplayValue(code)}
                isActive={code === baseCode}
                isEditMode={isEditMode}
                pendingReplace={code === baseCode && pendingReplace}
                style={{ maxHeight: MAX_CARD_HEIGHT }}
                onChangeCurrency={(c) => setModalMode(c)}
                onActivate={activateCurrency}
                onRemove={(code) => { removeCurrency(code); setIsEditMode(false); }}
              />
            );
          })
        )}
      </View>

      {lastUpdatedText && (
        <Text style={styles.lastUpdated}>{lastUpdatedText}</Text>
      )}

      <NumberPad
        onDigit={appendDigit}
        onDelete={deleteDigit}
        onClear={clearInput}
      />

      <AddCurrencyModal
        visible={modalMode !== null}
        title={modalMode === 'add' ? t.addCurrency : t.changeCurrency}
        occupiedCodes={occupiedInModal}
        onSelect={handleModalSelect}
        onClose={() => setModalMode(null)}
      />

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
  );
}

function makeStyles(colors: ColorScheme) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 10,
    },
    headerLeft: {
      flex: 1,
      marginRight: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: 0.2,
    },
    headerSub: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBtnActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    iconBtnAccent: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    iconBtnDisabled: {
      backgroundColor: colors.border,
      borderColor: colors.border,
    },
    iconBtnText: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textSecondary,
      lineHeight: 24,
    },
    iconBtnTextActive: {
      color: '#fff',
    },
    iconBtnTextAccent: {
      color: '#fff',
    },
    errorBanner: {
      marginHorizontal: 16,
      marginBottom: 4,
      backgroundColor: colors.removeBg,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    errorText: {
      fontSize: 12,
      color: colors.danger,
    },
    offlineBanner: {
      marginHorizontal: 16,
      marginBottom: 4,
      backgroundColor: colors.searchBg,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: colors.border,
    },
    offlineText: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
      marginBottom: 6,
    },
    cardList: {
      flex: 1,
      paddingHorizontal: 12,
      paddingBottom: 4,
    },
    emptyBox: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
    },
    emptyIcon: {
      fontSize: 44,
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 6,
    },
    emptyHint: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
    },
    lastUpdated: {
      fontSize: 11,
      color: colors.textMuted,
      textAlign: 'center',
      paddingVertical: 4,
    },
  });
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
