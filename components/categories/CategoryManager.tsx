import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useCategories } from '../../hooks/useCategories';
import { useAlert } from '@/template';
import { CATEGORY_COLORS } from '../../types/category';

interface CategoryManagerProps {
  visible: boolean;
  onClose: () => void;
}

export function CategoryManager({ visible, onClose }: CategoryManagerProps) {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { showAlert } = useAlert();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      showAlert('Error', 'Please enter a category name');
      return;
    }

    try {
      await addCategory(newCategoryName.trim(), selectedColor);
      setNewCategoryName('');
      setSelectedColor(CATEGORY_COLORS[0]);
      showAlert('Success', 'Category created');
    } catch (error) {
      showAlert('Error', 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingName.trim()) {
      showAlert('Error', 'Please enter a category name');
      return;
    }

    try {
      await updateCategory(id, { name: editingName.trim() });
      setEditingId(null);
      setEditingName('');
      showAlert('Success', 'Category updated');
    } catch (error) {
      showAlert('Error', 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string, categoryName: string) => {
    const otherCategories = categories.filter((c) => c.id !== id);
    
    if (otherCategories.length === 0) {
      showAlert('Error', 'You must have at least one category');
      return;
    }

    showAlert(
      'Delete Category',
      `Delete "${categoryName}"? Tasks will be moved to General.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Find General category or use first available
              const generalCategory = otherCategories.find((c) => c.name === 'General');
              const reassignTo = generalCategory?.id || otherCategories[0].id;
              
              await deleteCategory(id, reassignTo);
              showAlert('Success', 'Category deleted');
            } catch (error) {
              showAlert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.card, borderRadius: borderRadius.lg },
          ]}
        >
          <View
            style={[
              styles.header,
              {
                padding: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
              },
            ]}
          >
            <Text style={[styles.title, { fontSize: fontSize.xl, color: colors.text }]}>
              Manage Categories
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: spacing.xs }}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={[styles.content, { padding: spacing.md }]}>
            {/* Add New Category */}
            <View style={[styles.section, { marginBottom: spacing.lg }]}>
              <Text
                style={[
                  styles.sectionTitle,
                  { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
                ]}
              >
                ADD NEW CATEGORY
              </Text>

              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                    fontSize: fontSize.base,
                    color: colors.text,
                    marginBottom: spacing.sm,
                  },
                ]}
                placeholder="Category name"
                placeholderTextColor={colors.textTertiary}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />

              <Text
                style={[
                  styles.label,
                  { fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm },
                ]}
              >
                SELECT COLOR
              </Text>

              <View style={[styles.colorGrid, { marginBottom: spacing.md }]}>
                {CATEGORY_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      {
                        backgroundColor: color,
                        borderRadius: borderRadius.md,
                        width: 40,
                        height: 40,
                        margin: spacing.xs,
                        borderWidth: selectedColor === color ? 3 : 0,
                        borderColor: colors.background,
                      },
                      selectedColor === color && shadows.md,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.addButton,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                  },
                ]}
                onPress={handleAddCategory}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
                <Text
                  style={[
                    styles.addButtonText,
                    { fontSize: fontSize.base, color: '#FFF', marginLeft: spacing.sm },
                  ]}
                >
                  Add Category
                </Text>
              </TouchableOpacity>
            </View>

            {/* Existing Categories */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
                ]}
              >
                YOUR CATEGORIES
              </Text>

              {categories.map((category) => (
                <View
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderRadius: borderRadius.md,
                      padding: spacing.md,
                      marginBottom: spacing.sm,
                      borderLeftWidth: 4,
                      borderLeftColor: category.color,
                    },
                  ]}
                >
                  {editingId === category.id ? (
                    <View style={{ flex: 1 }}>
                      <TextInput
                        style={[
                          styles.editInput,
                          {
                            backgroundColor: colors.card,
                            borderRadius: borderRadius.sm,
                            padding: spacing.sm,
                            fontSize: fontSize.base,
                            color: colors.text,
                            marginBottom: spacing.sm,
                          },
                        ]}
                        value={editingName}
                        onChangeText={setEditingName}
                        autoFocus
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity
                          style={[
                            styles.editButton,
                            {
                              backgroundColor: colors.primary,
                              borderRadius: borderRadius.sm,
                              padding: spacing.sm,
                              marginRight: spacing.sm,
                            },
                          ]}
                          onPress={() => handleUpdateCategory(category.id)}
                        >
                          <Text
                            style={[styles.editButtonText, { fontSize: fontSize.sm, color: '#FFF' }]}
                          >
                            Save
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.editButton,
                            {
                              backgroundColor: colors.backgroundTertiary,
                              borderRadius: borderRadius.sm,
                              padding: spacing.sm,
                            },
                          ]}
                          onPress={() => {
                            setEditingId(null);
                            setEditingName('');
                          }}
                        >
                          <Text
                            style={[
                              styles.editButtonText,
                              { fontSize: fontSize.sm, color: colors.text },
                            ]}
                          >
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <View style={[styles.categoryInfo, { flex: 1 }]}>
                        <View
                          style={[
                            styles.colorIndicator,
                            {
                              backgroundColor: category.color,
                              width: 24,
                              height: 24,
                              borderRadius: borderRadius.sm,
                              marginRight: spacing.sm,
                            },
                          ]}
                        />
                        <Text
                          style={[styles.categoryName, { fontSize: fontSize.base, color: colors.text }]}
                        >
                          {category.name}
                        </Text>
                      </View>

                      <View style={styles.categoryActions}>
                        <TouchableOpacity
                          style={{ padding: spacing.sm, marginRight: spacing.xs }}
                          onPress={() => {
                            setEditingId(category.id);
                            setEditingName(category.name);
                          }}
                        >
                          <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{ padding: spacing.sm }}
                          onPress={() => handleDeleteCategory(category.id, category.name)}
                        >
                          <MaterialCommunityIcons name="delete" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
  },
  content: {
    maxHeight: 600,
  },
  section: {},
  sectionTitle: {
    fontWeight: '700',
  },
  input: {
    fontWeight: '400',
  },
  label: {
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  colorOption: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontWeight: '700',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {},
  categoryName: {
    fontWeight: '600',
  },
  categoryActions: {
    flexDirection: 'row',
  },
  editInput: {
    fontWeight: '400',
  },
  editActions: {
    flexDirection: 'row',
  },
  editButton: {},
  editButtonText: {
    fontWeight: '600',
  },
});
