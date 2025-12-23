import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../types/category';

interface CategoryPickerProps {
  selectedCategoryId?: string;
  onSelect: (categoryId: string | undefined) => void;
  showNone?: boolean;
}

export const CategoryPicker = React.memo(function CategoryPicker({ selectedCategoryId, onSelect, showNone = true }: CategoryPickerProps) {
  const { colors, spacing, fontSize, borderRadius } = useTheme();
  const { categories } = useCategories();

  const handleSelect = (category: Category | null) => {
    onSelect(category?.id);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: spacing.xs }}
      >
        {showNone && (
          <TouchableOpacity
            style={[
              styles.categoryItem,
              {
                backgroundColor: !selectedCategoryId ? colors.primary : colors.backgroundSecondary,
                borderRadius: borderRadius.md,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                marginRight: spacing.sm,
                borderWidth: !selectedCategoryId ? 0 : 1,
                borderColor: colors.divider,
              },
            ]}
            onPress={() => handleSelect(null)}
          >
            <MaterialCommunityIcons
              name="folder-outline"
              size={16}
              color={!selectedCategoryId ? '#FFF' : colors.text}
            />
            <Text
              style={[
                styles.categoryText,
                {
                  fontSize: fontSize.sm,
                  color: !selectedCategoryId ? '#FFF' : colors.text,
                  marginLeft: spacing.xs,
                },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
        )}

        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                {
                  backgroundColor: isSelected ? category.color : colors.backgroundSecondary,
                  borderRadius: borderRadius.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  marginRight: spacing.sm,
                  borderWidth: isSelected ? 0 : 1,
                  borderColor: colors.divider,
                },
              ]}
              onPress={() => handleSelect(category)}
            >
              {category.icon && (
                <MaterialCommunityIcons
                  name={category.icon as any}
                  size={16}
                  color={isSelected ? '#FFF' : category.color}
                />
              )}
              <Text
                style={[
                  styles.categoryText,
                  {
                    fontSize: fontSize.sm,
                    color: isSelected ? '#FFF' : colors.text,
                    marginLeft: category.icon ? spacing.xs : 0,
                  },
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {},
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontWeight: '600',
  },
});
