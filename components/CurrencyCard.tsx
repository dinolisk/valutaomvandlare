import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { Currency, getFlagUrl } from '../data/currencies';
import { getLocalizedName } from '../data/currencyNames';
import { useSettings } from '../contexts/SettingsContext';
import { ColorScheme } from '../constants/theme';

const TABLET_MIN_WIDTH = 768;

interface Props {
  currency: Currency;
  value: string;
  isActive: boolean;
  isEditMode: boolean;
  pendingReplace: boolean;
  /** List row height budget from App (see MAX_CARD_HEIGHT); caps minHeight on small screens */
  maxCardHeight: number;
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
  maxCardHeight,
  style,
  onChangeCurrency,
  onActivate,
  onRemove,
}: Props) {
  const { colors, language } = useSettings();
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_MIN_WIDTH;
  const styles = makeStyles(colors, isTablet);
  const localizedName = getLocalizedName(currency.code, language, currency.name);
  const cardMinHeight = Math.min(64, maxCardHeight);

  return (
    <View style={[styles.card, isActive && styles.cardActive, { minHeight: cardMinHeight }, style]}>
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

function makeStyles(colors: ColorScheme, isTablet: boolean) {
  const flagSize = isTablet ? 52 : 42;
  const flagRadius = flagSize / 2;

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
      paddingLeft: isTablet ? 20 : 14,
      paddingVertical: 10,
      paddingRight: 8,
    },
    flagCircle: {
      width: flagSize,
      height: flagSize,
      borderRadius: flagRadius,
      marginRight: isTablet ? 16 : 12,
      overflow: 'visible',
    },
    flagInner: {
      width: flagSize,
      height: flagSize,
      borderRadius: flagRadius,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.15)',
    } as ViewStyle,
    flagImage: {
      width: flagSize,
      height: flagSize,
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
      fontSize: isTablet ? 18 : 16,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: 0.3,
    },
    name: {
      fontSize: isTablet ? 13 : 11,
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
      paddingHorizontal: isTablet ? 20 : 14,
      paddingVertical: 10,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    value: {
      fontSize: isTablet ? 24 : 20,
      fontWeight: '600',
      color: colors.textSecondary,
      textAlign: 'right',
    },
    valueActive: {
      color: colors.accent,
      fontSize: isTablet ? 26 : 22,
      fontWeight: '700',
    },
    valuePending: {
      opacity: 0.6,
    },
  });
}
