import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { appTheme } from '../constants/theme';

interface HeaderBarProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
}

export function HeaderBar({
  title,
  showBackButton = true,
  onBackPress,
  rightElement,
}: HeaderBarProps) {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.slot}>
        {showBackButton ? (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={22} color={appTheme.colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.brandMark}>
            <Feather name="book-open" size={17} color={appTheme.colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={[styles.slot, styles.slotRight]}>
        {rightElement ?? null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: appTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.border,
  },
  slot: {
    width: 44,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  slotRight: {
    alignItems: 'flex-end',
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FDF3F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'IBM_Plex_Sans',
    fontSize: 17,
    fontWeight: '700',
    color: appTheme.colors.textPrimary,
    letterSpacing: -0.3,
  },
});
