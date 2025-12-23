
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Task } from '../../types/task';
import { useTheme } from '../../hooks/useTheme';
import { useTasks } from '../../hooks/useTasks';
import { useAlert } from '../../template';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
}

// Memoized component to prevent unnecessary re-renders
export const TaskItem = React.memo(function TaskItem({ task, onPress }: TaskItemProps) {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const { toggleComplete, deleteTask, deleteAllRecurring } = useTasks();
  const { showAlert } = useAlert();

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return colors.priorityHigh;
      case 'medium':
        return colors.priorityMedium;
      case 'low':
        return colors.priorityLow;
      default:
        return colors.textTertiary;
    }
  };

  const getPriorityBg = () => {
    switch (task.priority) {
      case 'high':
        return colors.priorityHighBg;
      case 'medium':
        return colors.priorityMediumBg;
      case 'low':
        return colors.priorityLowBg;
      default:
        return colors.backgroundTertiary;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate.getTime() === today.getTime()) return 'Today';
    if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = () => {
    if (!task.dueDate || task.completed) return false;
    const now = new Date();
    const due = new Date(task.dueDate);
    return due < now && due.toDateString() !== now.toDateString();
  };

  const isDueToday = () => {
    if (!task.dueDate || task.completed) return false;
    const now = new Date();
    const due = new Date(task.dueDate);
    return due.toDateString() === now.toDateString();
  };

  const handleToggle = async () => {
    await toggleComplete(task.id);
  };

  const handleDelete = async () => {
    if (task.recurrenceType !== 'none') {
      showAlert(
        'Delete Recurring Task',
        'What would you like to delete?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Only This',
            onPress: async () => {
              await deleteTask(task.id);
            },
          },
          {
            text: 'All Occurrences',
            style: 'destructive',
            onPress: async () => {
              await deleteAllRecurring(task.id);
            },
          },
        ]
      );
    } else {
      await deleteTask(task.id);
    }
  };

  const getRecurrenceLabel = () => {
    if (task.recurrenceType === 'none') return null;
    
    switch (task.recurrenceType) {
      case 'daily':
        return task.recurrenceInterval === 1 ? 'Daily' : `Every ${task.recururrenceInterval} days`;
      case 'weekly':
        return task.recurrenceInterval === 1 ? 'Weekly' : `Every ${task.recurrenceInterval} weeks`;
      case 'monthly':
        return task.recurrenceInterval === 1 ? 'Monthly' : `Every ${task.recurrenceInterval} months`;
      case 'custom':
        if (task.recurrenceDays && task.recurrenceDays.length > 0) {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const days = task.recurrenceDays.map(d => dayNames[d]).join(', ');
          return `Weekly: ${days}`;
        }
        return 'Custom';
      default:
        return null;
    }
  };

  const getCardStyle = () => {
    if (isOverdue()) {
      return {
        backgroundColor: colors.card,
        borderLeftWidth: 4,
        borderLeftColor: colors.error,
        borderWidth: 1,
        borderColor: colors.error + '30',
      };
    }
    if (isDueToday()) {
      return {
        backgroundColor: colors.card,
        borderLeftWidth: 4,
        borderLeftColor: colors.warning,
        borderWidth: 1,
        borderColor: colors.warning + '30',
      };
    }
    return {
      backgroundColor: colors.card,
      borderLeftWidth: 4,
      borderLeftColor: task.categoryColor || getPriorityColor(),
    };
  };

  return (
    <Animated.View
      entering={FadeInRight.duration(150)}
      exiting={FadeOutLeft.duration(150)}
      style={[
        styles.container,
        {
          borderRadius: borderRadius.md,
          padding: spacing.md,
          marginBottom: spacing.sm,
        },
        getCardStyle(),
        shadows.sm,
      ]}
    >
      <TouchableOpacity
        onPress={handleToggle}
        style={[
          styles.checkbox,
          {
            borderColor: getPriorityColor(),
            backgroundColor: task.completed ? getPriorityColor() : 'transparent',
            borderRadius: borderRadius.sm,
          },
        ]}
      >
        {task.completed && (
          <MaterialCommunityIcons name="check" size={18} color="#FFF" />
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onPress} style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              fontSize: fontSize.base,
              color: task.completed ? colors.textTertiary : colors.text,
              textDecorationLine: task.completed ? 'line-through' : 'none',
            },
          ]}
          numberOfLines={1}
        >
          {task.title}
        </Text>

        {task.description && (
          <Text
            style={[
              styles.description,
              {
                fontSize: fontSize.sm,
                color: colors.textSecondary,
                marginTop: spacing.xs,
              },
            ]}
            numberOfLines={2}
          >
            {task.description}
          </Text>
        )}

        <View style={[styles.footer, { marginTop: spacing.sm }]}>
          {task.categoryName && (
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: task.categoryColor || colors.backgroundTertiary,
                  borderRadius: borderRadius.sm,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  marginRight: spacing.sm,
                },
              ]}
            >
              {task.categoryIcon && (
                <MaterialCommunityIcons
                  name={task.categoryIcon as any}
                  size={12}
                  color="#FFF"
                />
              )}
              <Text
                style={[
                  styles.categoryText,
                  {
                    fontSize: fontSize.xs,
                    color: '#FFF',
                    marginLeft: task.categoryIcon ? spacing.xs : 0,
                  },
                ]}
              >
                {task.categoryName}
              </Text>
            </View>
          )}

          <View
            style={[
              styles.priorityBadge,
              {
                backgroundColor: getPriorityBg(),
                borderRadius: borderRadius.sm,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
              },
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                { fontSize: fontSize.xs, color: getPriorityColor() },
              ]}
            >
              {task.priority.toUpperCase()}
            </Text>
          </View>

          {getRecurrenceLabel() && (
            <View
              style={[
                styles.recurrenceBadge,
                {
                  backgroundColor: colors.backgroundTertiary,
                  borderRadius: borderRadius.sm,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  marginLeft: spacing.sm,
                },
              ]}
            >
              <MaterialCommunityIcons name="repeat" size={12} color={colors.primary} />
              <Text
                style={[
                  styles.recurrenceText,
                  { fontSize: fontSize.xs, color: colors.primary, marginLeft: spacing.xs },
                ]}
              >
                {getRecurrenceLabel()}
              </Text>
            </View>
          )}

          {task.dueDate && (
            <View
              style={[
                styles.dateContainer,
                {
                  marginLeft: spacing.sm,
                  backgroundColor: isOverdue() ? colors.errorBg : isDueToday() ? colors.warningBg : 'transparent',
                  paddingHorizontal: isOverdue() || isDueToday() ? spacing.sm : 0,
                  paddingVertical: isOverdue() || isDueToday() ? spacing.xs : 0,
                  borderRadius: borderRadius.sm,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={isOverdue() ? 'calendar-alert' : isDueToday() ? 'clock-alert-outline' : 'calendar'}
                size={14}
                color={isOverdue() ? colors.error : isDueToday() ? colors.warning : colors.textSecondary}
              />
              <Text
                style={[
                  styles.dateText,
                  {
                    fontSize: fontSize.xs,
                    color: isOverdue() ? colors.error : isDueToday() ? colors.warning : colors.textSecondary,
                    marginLeft: spacing.xs,
                    fontWeight: isOverdue() || isDueToday() ? '700' : '500',
                  },
                ]}
              >
                {isOverdue() ? '⚠️ ' : isDueToday() ? '🔔 ' : ''}{formatDate(task.dueDate)}
              </Text>
            </View>
          )}
        </View>

        {task.subtasks && task.subtasks.length > 0 && (
          <View style={[styles.subtaskProgress, { marginTop: spacing.sm }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="format-list-checks" size={14} color={colors.primary} />
              <Text
                style={[
                  styles.subtaskText,
                  {
                    fontSize: fontSize.xs,
                    color: colors.textSecondary,
                    marginLeft: spacing.xs,
                  },
                ]}
              >
                {task.subtasks.filter(s => s.completed).length} / {task.subtasks.length} completed
              </Text>
            </View>
            <View
              style={[
                styles.progressBarContainer,
                {
                  backgroundColor: colors.backgroundTertiary,
                  borderRadius: borderRadius.xs,
                  height: 4,
                  marginTop: spacing.xs,
                  overflow: 'hidden',
                },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: colors.success,
                    height: '100%',
                    width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%`,
                    borderRadius: borderRadius.xs,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDelete} style={[styles.deleteButton, { padding: spacing.xs }]}>
        <MaterialCommunityIcons name="delete-outline" size={20} color={colors.textTertiary} />
      </TouchableOpacity>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal performance
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.completed === nextProps.task.completed &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.description === nextProps.task.description &&
    prevProps.task.priority === nextProps.task.priority &&
    prevProps.task.dueDate === nextProps.task.dueDate &&
    prevProps.task.categoryName === nextProps.task.categoryName &&
    prevProps.task.categoryColor === nextProps.task.categoryColor &&
    prevProps.task.recurrenceType === nextProps.task.recurrenceType &&
    prevProps.task.subtasks?.length === nextProps.task.subtasks?.length &&
    prevProps.task.subtasks?.filter(s => s.completed).length === nextProps.task.subtasks?.filter(s => s.completed).length
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontWeight: '600',
  },
  description: {
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontWeight: '600',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontWeight: '700',
  },
  recurrenceBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  recurrenceText: {
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontWeight: '500',
  },
  deleteButton: {
    marginLeft: 8,
  },
  subtaskProgress: {},
  subtaskText: {
    fontWeight: '500',
  },
  progressBarContainer: {},
  progressBarFill: {},
});
