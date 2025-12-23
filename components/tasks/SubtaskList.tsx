import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutRight } from 'react-native-reanimated';
import { Subtask } from '../../types/task';
import { useTheme } from '../../hooks/useTheme';
import { useTasks } from '../../hooks/useTasks';

interface SubtaskListProps {
  taskId: string;
  subtasks: Subtask[];
  editable?: boolean;
}

export function SubtaskList({ taskId, subtasks, editable = true }: SubtaskListProps) {
  const { colors, spacing, fontSize, borderRadius } = useTheme();
  const { addSubtask, deleteSubtask, toggleSubtask } = useTasks();
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    
    try {
      await addSubtask(taskId, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  };

  const handleToggleSubtask = async (id: string) => {
    try {
      await toggleSubtask(id);
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const handleDeleteSubtask = async (id: string) => {
    try {
      await deleteSubtask(id);
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  return (
    <View style={styles.container}>
      {subtasks.map((subtask, index) => (
        <Animated.View
          key={subtask.id}
          entering={FadeInDown.delay(index * 50)}
          exiting={FadeOutRight}
          style={[
            styles.subtaskItem,
            {
              paddingVertical: spacing.sm,
              borderBottomWidth: index < subtasks.length - 1 ? 1 : 0,
              borderBottomColor: colors.divider,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => handleToggleSubtask(subtask.id)}
            style={[
              styles.checkbox,
              {
                borderColor: subtask.completed ? colors.success : colors.textTertiary,
                backgroundColor: subtask.completed ? colors.success : 'transparent',
                borderRadius: borderRadius.xs,
              },
            ]}
          >
            {subtask.completed && (
              <MaterialCommunityIcons name="check" size={14} color="#FFF" />
            )}
          </TouchableOpacity>

          <Text
            style={[
              styles.subtaskTitle,
              {
                fontSize: fontSize.base,
                color: subtask.completed ? colors.textTertiary : colors.text,
                textDecorationLine: subtask.completed ? 'line-through' : 'none',
                marginLeft: spacing.sm,
                flex: 1,
              },
            ]}
          >
            {subtask.title}
          </Text>

          {editable && (
            <TouchableOpacity
              onPress={() => handleDeleteSubtask(subtask.id)}
              style={{ padding: spacing.xs }}
            >
              <MaterialCommunityIcons
                name="close"
                size={18}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </Animated.View>
      ))}

      {editable && (
        <View
          style={[
            styles.addSubtaskContainer,
            {
              marginTop: spacing.sm,
              paddingTop: spacing.sm,
              borderTopWidth: subtasks.length > 0 ? 1 : 0,
              borderTopColor: colors.divider,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                flex: 1,
                fontSize: fontSize.base,
                color: colors.text,
                paddingVertical: spacing.sm,
              },
            ]}
            placeholder="Add subtask"
            placeholderTextColor={colors.textTertiary}
            value={newSubtaskTitle}
            onChangeText={setNewSubtaskTitle}
            onSubmitEditing={handleAddSubtask}
            returnKeyType="done"
          />
          
          {newSubtaskTitle.trim() && (
            <TouchableOpacity
              onPress={handleAddSubtask}
              style={[
                styles.addButton,
                {
                  backgroundColor: colors.primary,
                  borderRadius: borderRadius.sm,
                  padding: spacing.xs,
                  marginLeft: spacing.sm,
                },
              ]}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtaskTitle: {
    fontWeight: '400',
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    fontWeight: '400',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
