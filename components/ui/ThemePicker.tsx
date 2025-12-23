import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useSettings } from '../../hooks/useSettings';
import { THEMES, THEME_CATEGORIES, ThemeCategory, ThemeDefinition } from '../../constants/theme';

interface ThemePickerProps {
  visible: boolean;
  onClose: () => void;
}

export function ThemePicker({ visible, onClose }: ThemePickerProps) {
  const { colors, spacing, fontSize, borderRadius, shadows, themeId: currentThemeId } = useTheme();
  const { setThemeId } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>('dark');
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleSelectTheme = async (themeId: string) => {
    await setThemeId(themeId);
    // Small delay to show selection before closing
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Group themes by category
  const themesByCategory = Object.values(THEMES).reduce((acc, theme) => {
    if (!acc[theme.category]) {
      acc[theme.category] = [];
    }
    acc[theme.category].push(theme);
    return acc;
  }, {} as Record<ThemeCategory, ThemeDefinition[]>);

  const renderThemeCard = (theme: ThemeDefinition) => {
    const isSelected = theme.id === currentThemeId;

    return (
      <TouchableOpacity
        key={theme.id}
        style={[
          styles.themeCard,
          {
            backgroundColor: colors.card,
            borderRadius: borderRadius.md,
            marginBottom: spacing.md,
            marginHorizontal: spacing.xs,
            borderWidth: 2,
            borderColor: isSelected ? colors.primary : 'transparent',
          },
          shadows.md,
        ]}
        onPress={() => handleSelectTheme(theme.id)}
      >
        {/* Color Preview */}
        <View style={styles.colorPreview}>
          <View
            style={[
              styles.colorBlock,
              {
                backgroundColor: theme.colors.background,
                borderTopLeftRadius: borderRadius.md - 2,
                borderBottomLeftRadius: borderRadius.md - 2,
              },
            ]}
          />
          <View
            style={[
              styles.colorBlock,
              { backgroundColor: theme.colors.primary },
            ]}
          />
          <View
            style={[
              styles.colorBlock,
              { backgroundColor: theme.colors.card },
            ]}
          />
          <View
            style={[
              styles.colorBlock,
              {
                backgroundColor: theme.colors.backgroundSecondary,
                borderTopRightRadius: borderRadius.md - 2,
                borderBottomRightRadius: borderRadius.md - 2,
              },
            ]}
          />
        </View>

        {/* Theme Info */}
        <View style={[styles.themeInfo, { padding: spacing.sm }]}>
          <View style={styles.themeHeader}>
            <Text
              style={[
                styles.themeName,
                { fontSize: fontSize.base, color: colors.text },
              ]}
            >
              {theme.name}
            </Text>
            {isSelected && (
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={colors.primary}
              />
            )}
          </View>

          {theme.isGradient && (
            <View
              style={[
                styles.gradientBadge,
                {
                  backgroundColor: colors.backgroundTertiary,
                  borderRadius: borderRadius.sm,
                  paddingHorizontal: spacing.xs,
                  paddingVertical: 2,
                  marginTop: spacing.xs,
                },
              ]}
            >
              <Text
                style={[
                  styles.gradientText,
                  { fontSize: fontSize.xs, color: colors.textSecondary },
                ]}
              >
                Gradient
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: colors.background, opacity: fadeAnim },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              borderBottomWidth: 1,
              borderBottomColor: colors.divider,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              { fontSize: fontSize.title, color: colors.text },
            ]}
          >
            Choose Theme
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.closeButton,
              {
                backgroundColor: colors.backgroundSecondary,
                borderRadius: borderRadius.round,
                width: 36,
                height: 36,
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.categoryTabs,
            { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
          ]}
        >
          {(Object.keys(THEME_CATEGORIES) as ThemeCategory[]).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                {
                  backgroundColor:
                    selectedCategory === category
                      ? colors.primary
                      : colors.backgroundSecondary,
                  borderRadius: borderRadius.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  marginRight: spacing.sm,
                },
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    fontSize: fontSize.sm,
                    color:
                      selectedCategory === category
                        ? '#FFF'
                        : colors.text,
                  },
                ]}
              >
                {THEME_CATEGORIES[category]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Themes Grid */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.themesGrid,
            { paddingHorizontal: spacing.sm, paddingBottom: spacing.xl },
          ]}
        >
          <View style={styles.gridRow}>
            {themesByCategory[selectedCategory]?.map(renderThemeCard)}
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '700',
  },
  closeButton: {},
  categoryTabs: {},
  categoryTab: {},
  categoryText: {
    fontWeight: '600',
  },
  themesGrid: {},
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  themeCard: {
    width: '48%',
    overflow: 'hidden',
  },
  colorPreview: {
    flexDirection: 'row',
    height: 80,
  },
  colorBlock: {
    flex: 1,
  },
  themeInfo: {},
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeName: {
    fontWeight: '600',
    flex: 1,
  },
  gradientBadge: {
    alignSelf: 'flex-start',
  },
  gradientText: {
    fontWeight: '600',
  },
});
