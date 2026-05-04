import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
  Pressable,
} from 'react-native';
import Constants from 'expo-constants';
import { useSettings } from '../contexts/SettingsContext';
import { ThemePref } from '../contexts/SettingsContext';
import { Language, LANGUAGE_LABELS } from '../constants/translations';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const PRIVACY_POLICY_URL =
  'https://github.com/Dinolisk/Valutaomvandlare/blob/master/PRIVACY-POLICY.md';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: { value: ThemePref; labelKey: 'themeLight' | 'themeDark' | 'themeSystem' }[] = [
  { value: 'light', labelKey: 'themeLight' },
  { value: 'dark', labelKey: 'themeDark' },
  { value: 'system', labelKey: 'themeSystem' },
];

const LANGUAGE_OPTIONS: Language[] = ['sv', 'en', 'es'];

export default function SettingsModal({ visible, onClose }: Props) {
  const { colors, t, language, themePref, setLanguage, setThemePref } = useSettings();

  const styles = makeStyles(colors);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
        <SafeAreaView style={styles.sheetInner}>
          {/* Handle */}
          <View style={styles.handle} />

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{t.settings}</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Theme section */}
            <Text style={styles.sectionLabel}>{t.theme}</Text>
            <View style={styles.optionGroup}>
              {THEME_OPTIONS.map(({ value, labelKey }) => {
                const active = themePref === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.optionRow, active && styles.optionRowActive]}
                    onPress={() => setThemePref(value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {t[labelKey]}
                    </Text>
                    {active && <View style={styles.dot} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Language section */}
            <Text style={styles.sectionLabel}>{t.language}</Text>
            <View style={styles.optionGroup}>
              {LANGUAGE_OPTIONS.map((lang) => {
                const active = language === lang;
                return (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.optionRow, active && styles.optionRowActive]}
                    onPress={() => setLanguage(lang)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {LANGUAGE_LABELS[lang]}
                    </Text>
                    {active && <View style={styles.dot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
            {/* About */}
            <Text style={styles.sectionLabel}>{t.about}</Text>
            <View style={styles.optionGroup}>
              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>{t.privacyPolicy}</Text>
                <Text style={styles.linkArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Version */}
            <Text style={styles.version}>Version {APP_VERSION}</Text>
          </ScrollView>
        </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function makeStyles(colors: import('../constants/theme').ColorScheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
      maxHeight: '80%',
    },
    sheetInner: {
      backgroundColor: colors.modalBg,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: 24,
      overflow: 'hidden',
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 4,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.searchBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeBtnText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.accent,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginTop: 20,
      marginBottom: 8,
    },
    optionGroup: {
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 15,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.separator,
    },
    optionRowActive: {
      backgroundColor: colors.cardFocused,
    },
    optionText: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    optionTextActive: {
      color: colors.accent,
      fontWeight: '600',
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.accent,
    },
    linkArrow: {
      fontSize: 20,
      color: colors.textMuted,
      lineHeight: 24,
    },
    version: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 28,
      marginBottom: 4,
    },
  });
}
