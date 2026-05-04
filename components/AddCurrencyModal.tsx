import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { ALL_CURRENCIES, Currency, getFlagUrl } from '../data/currencies';
import { getLocalizedName } from '../data/currencyNames';
import { useSettings } from '../contexts/SettingsContext';
import { ColorScheme } from '../constants/theme';

interface Props {
  visible: boolean;
  title?: string;
  occupiedCodes: string[];
  onSelect: (code: string) => void;
  onClose: () => void;
}

export default function AddCurrencyModal({
  visible,
  title,
  occupiedCodes,
  onSelect,
  onClose,
}: Props) {
  const { colors, t, language } = useSettings();
  const styles = makeStyles(colors);
  const [search, setSearch] = useState('');

  const modalTitle = title ?? t.addCurrency;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ALL_CURRENCIES;
    return ALL_CURRENCIES.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    );
  }, [search]);

  const handleAdd = (code: string) => {
    onSelect(code);
    onClose();
    setSearch('');
  };

  const handleClose = () => {
    onClose();
    setSearch('');
  };

  const renderItem = ({ item }: { item: Currency }) => {
    const isActive = occupiedCodes.includes(item.code);
    return (
      <TouchableOpacity
        style={[styles.item, isActive && styles.itemActive]}
        onPress={() => !isActive && handleAdd(item.code)}
        activeOpacity={isActive ? 1 : 0.7}
      >
        <View style={styles.itemFlagCircle}>
          <View style={styles.itemFlagInner}>
            <Image
              source={{ uri: getFlagUrl(item.countryCode) }}
              style={styles.itemFlagImage}
              resizeMode="cover"
            />
          </View>
        </View>
        <View style={styles.itemLabels}>
          <Text style={[styles.itemCode, isActive && styles.itemCodeActive]}>
            {item.code}
          </Text>
          <Text style={styles.itemName}>{getLocalizedName(item.code, language, item.name)}</Text>
          <Text style={styles.itemCountry} numberOfLines={1}>{item.country}</Text>
        </View>
        {isActive ? (
          <View style={styles.addedBadge}>
            <Text style={styles.addedText}>{t.alreadyAdded}</Text>
          </View>
        ) : (
          <View style={styles.addBtn}>
            <Text style={styles.addBtnText}>+</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>{modalTitle}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            autoCapitalize="characters"
            selectionColor={colors.accent}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          style={styles.flatList}
        />
      </View>
    </Modal>
  );
}

function makeStyles(colors: ColorScheme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    sheet: {
      backgroundColor: colors.modalBg,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      height: '80%',
      paddingBottom: 32,
    },
    flatList: {
      flex: 1,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 4,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
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
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeBtnText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.searchBg,
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      fontSize: 16,
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 15,
      paddingVertical: 12,
    },
    clearText: {
      color: colors.textMuted,
      fontSize: 12,
      padding: 4,
    },
    list: {
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    itemActive: {
      opacity: 0.5,
    },
    itemFlagCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
      overflow: 'visible',
    },
    itemFlagInner: {
      width: 40,
      height: 40,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.15)',
    },
    itemFlagImage: {
      width: 40,
      height: 40,
    },
    itemLabels: {
      flex: 1,
    },
    itemCode: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    itemCodeActive: {
      color: colors.textSecondary,
    },
    itemName: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 1,
    },
    itemCountry: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 1,
    },
    addBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addBtnText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 22,
    },
    addedBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: colors.border,
    },
    addedText: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '600',
    },
    separator: {
      height: 1,
      backgroundColor: colors.separator,
      marginHorizontal: 4,
    },
  });
}
