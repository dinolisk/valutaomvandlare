import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { ColorScheme } from '../constants/theme';

interface Props {
  onDigit: (d: string) => void;
  onDelete: () => void;
  onClear: () => void;
  compact?: boolean;
}

const DIGIT_ROWS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
];

// 0 is first (left, same width as number keys), then , / C / ⌫ share remaining 2/3
const BOTTOM_LEFT = '0';
const BOTTOM_RIGHT = [',', 'C', '⌫'];

export default function NumberPad({ onDigit, onDelete, onClear, compact = false }: Props) {
  const { colors } = useSettings();
  const styles = makeStyles(colors, compact);

  const handlePress = (key: string) => {
    if (key === '⌫') onDelete();
    else if (key === 'C') onClear();
    else onDigit(key);
  };

  return (
    <View style={styles.pad}>
      {DIGIT_ROWS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              style={styles.key}
              onPress={() => handlePress(key)}
              activeOpacity={0.7}
            >
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Bottom row — 0 (left, same width as numbers), then , / C / ⌫ share remaining space */}
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.key}
          onPress={() => handlePress(BOTTOM_LEFT)}
          activeOpacity={0.7}
        >
          <Text style={styles.keyText}>{BOTTOM_LEFT}</Text>
        </TouchableOpacity>
        {BOTTOM_RIGHT.map((key) => {
          const isClear = key === 'C';
          const isDelete = key === '⌫';
          const isComma = key === ',';
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.keySmallFlex,
                isClear && styles.keyClear,
                isDelete && styles.keyDelete,
              ]}
              onPress={() => handlePress(key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.keyText,
                  isClear && styles.keyTextClear,
                  isDelete && styles.keyTextDelete,
                  isComma && styles.keyTextComma,
                ]}
              >
                {key}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function makeStyles(colors: ColorScheme, compact: boolean) {
  return StyleSheet.create({
    pad: {
      flex: compact ? 1 : undefined,
      maxHeight: compact ? 560 : undefined,
      paddingHorizontal: 16,
      paddingBottom: compact ? 12 : 24,
      paddingTop: compact ? 12 : 8,
      gap: compact ? 8 : undefined,
      backgroundColor: colors.card,
      borderTopWidth: compact ? 0 : 1,
      borderTopColor: colors.border,
    },
    row: {
      flex: compact ? 1 : undefined,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: compact ? 0 : 10,
    },
    key: {
      flex: 3,
      marginHorizontal: 4,
      height: compact ? undefined : 54,
      borderRadius: 14,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    keySmallFlex: {
      flex: 2,
      marginHorizontal: 4,
      height: compact ? undefined : 54,
      borderRadius: 14,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    keyClear: {
      backgroundColor: colors.removeBg,
      borderColor: colors.border,
    },
    keyDelete: {
      backgroundColor: colors.removeBg,
      borderColor: colors.border,
    },
    keyText: {
      fontSize: compact ? 26 : 21,
      fontWeight: '500',
      color: colors.textPrimary,
    },
    keyTextClear: {
      fontSize: compact ? 20 : 16,
      fontWeight: '700',
      color: colors.danger,
    },
    keyTextDelete: {
      fontSize: compact ? 24 : 19,
      color: colors.accent,
      fontWeight: '700',
    },
    keyTextComma: {
      fontSize: compact ? 30 : 24,
      fontWeight: '700',
    },
  });
}
