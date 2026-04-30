import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  ViewStyle,
} from 'react-native';
import { Currency, getFlagUrl } from '../data/currencies';
import { getLocalizedName } from '../data/currencyNames';
import { useSettings } from '../contexts/SettingsContext';
import { ColorScheme } from '../constants/theme';

interface Props {
  currency: Currency;
  value: string;
  isActive: boolean;
  isEditMode: boolean;
  pendingReplace: boolean;
  style?: ViewStyle;
  onChangeCurrency: (code: string) => void;
  onActivate: (code: string) => void;
  onRemove: (code: string) => void;
}

export default function CurrencyCard({
  currency,
  value,
  isActive,
  isEditMode,
  pendingReplace,
  style,
  onChangeCurrency,
  onActivate,
  onRemove,
}: Props) {
  const { colors, language } = useSettings();
  const styles = makeStyles(colors);
  const localizedName = getLocalizedName(currency.code, language, currency.name);

  return (
    <View style={[styles.card, isActive && styles.cardActive, style]}>
      {isActive && <View style={styles.accentBar} />}

      {/* Left: flag + code/name — tap to swap currency in this slot */}
      <TouchableOpacity
        style={styles.left}
        onPress={() => onChangeCurrency(currency.code)}
        activeOpacity={0.7}
      >
        <View style={styles.flagCircle}>
          <View style={styles.flagInner}>
            <Image
              source={{ uri: getFlagUrl(currency.countryCode) }}
              style={styles.flagImage}
              resizeMode="cover"
            />
          </View>
          {isEditMode && (
            <TouchableOpacity
              style={styles.removeBadge}
              onPress={() => onRemove(currency.code)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.removeBadgeText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.labels}>
          <Text style={styles.code}>{currency.code}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {localizedName}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.verticalDivider} />

      {/* Right: value — tap to activate numpad for this currency */}
      <TouchableOpacity
        style={styles.right}
        onPress={() => onActivate(currency.code)}
        activeOpacity={0.6}
      >
        <Text
          style={[
            styles.value,
            isActive && styles.valueActive,
            pendingReplace && styles.valuePending,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {value}{pendingReplace ? '|' : ''}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(colors: ColorScheme) {
  return StyleSheet.create({
    card: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 14,
      marginBottom: 6,
      borderWidth: 1.5,
      borderColor: colors.border,
      overflow: 'hidden',
      minHeight: 64,
      maxHeight: 110,
      ...Platform.select({
        web: { boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)' },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 1,
        },
      }),
    } as ViewStyle,
    cardActive: {
      borderColor: colors.accent,
      backgroundColor: colors.cardFocused,
    },
    accentBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: colors.accent,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingLeft: 14,
      paddingVertical: 10,
      paddingRight: 8,
    },
    flagCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      marginRight: 12,
      overflow: 'visible',
    },
    flagInner: {
      width: 42,
      height: 42,
      borderRadius: 21,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.15)',
    } as ViewStyle,
    flagImage: {
      width: 42,
      height: 42,
    },
    removeBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.danger,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    removeBadgeText: {
      color: '#fff',
      fontSize: 9,
      fontWeight: '900',
      lineHeight: 11,
    },
    labels: {
      flexShrink: 1,
    },
    code: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: 0.3,
    },
    name: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 1,
    },
    verticalDivider: {
      width: 1,
      height: '60%',
      backgroundColor: colors.border,
    },
    right: {
      width: '54%',
      paddingHorizontal: 14,
      paddingVertical: 10,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    value: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'right',
    },
    valueActive: {
      color: colors.accent,
      fontSize: 22,
      fontWeight: '700',
    },
    valuePending: {
      opacity: 0.6,
    },
  });
}
