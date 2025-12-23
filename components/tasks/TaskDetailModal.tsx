import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Task } from '../../types/task';
import { SubtaskList } from './SubtaskList';

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
}

export function TaskDetailModal({ visible, task, onClose }: TaskDetailModalProps) {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();

  if (!task) return null;

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
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const isPast = date < now && !isToday;

    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    if (isToday) return `Today, ${timeStr}`;
    if (isTomorrow) return `Tomorrow, ${timeStr}`;
    if (isPast) return `⚠️ Overdue: ${dateStr}, ${timeStr}`;
    return `${dateStr}, ${timeStr}`;
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

  const getRecurrenceLabel = () => {
    if (task.recurrenceType === 'none') return null;
    
    switch (task.recurrenceType) {
      case 'daily':
        return task.recurrenceInterval === 1 ? 'Daily' : `Every ${task.recurrenceInterval} days`;
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

  const subtaskProgress = task.subtasks ? {
    completed: task.subtasks.filter(s => s.completed).length,
    total: task.subtasks.length,
  } : { completed: 0, total: 0 };

  const dueDateColor = isOverdue() ? colors.error : isDueToday() ? colors.warning : colors.textSecondary;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: borderRadius.lg }]}>
          <View style={[styles.header, { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { fontSize: fontSize.xl, color: colors.text }]}>
                {task.title}
              </Text>
              
              <View style={[styles.metaContainer, { marginTop: spacing.sm }]}>
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

                {task.completed && (
                  <View
                    style={[
                      styles.completedBadge,
                      {
                        backgroundColor: colors.successBg,
                        borderRadius: borderRadius.sm,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs,
                        marginLeft: spacing.sm,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name="check-circle" size={12} color={colors.success} />
                    <Text
                      style={[
                        styles.completedText,
                        { fontSize: fontSize.xs, color: colors.success, marginLeft: spacing.xs },
                      ]}
                    >
                      COMPLETED
                    </Text>
                  </View>
                )}

                {isOverdue() && (
                  <View
                    style={[
                      styles.overdueBadge,
                      {
                        backgroundColor: colors.errorBg,
                        borderRadius: borderRadius.sm,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs,
                        marginLeft: spacing.sm,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name="alert-circle" size={12} color={colors.error} />
                    <Text
                      style={[
                        styles.overdueText,
                        { fontSize: fontSize.xs, color: colors.error, marginLeft: spacing.xs },
                      ]}
                    >
                      OVERDUE
                    </Text>
                  </View>
                )}

                {isDueToday() && (
                  <View
                    style={[
                      styles.dueTodayBadge,
                      {
                        backgroundColor: colors.warningBg,
                        borderRadius: borderRadius.sm,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs,
                        marginLeft: spacing.sm,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name="clock-alert-outline" size={12} color={colors.warning} />
                    <Text
                      style={[
                        styles.dueTodayText,
                        { fontSize: fontSize.xs, color: colors.warning, marginLeft: spacing.xs },
                      ]}
                    >
                      DUE TODAY
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={{ padding: spacing.xs }}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={[styles.content, { padding: spacing.md }]}>
            {task.description && (
              <View style={[styles.section, { marginBottom: spacing.lg }]}>
                <Text style={[styles.sectionTitle, { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm }]}>
                  DESCRIPTION
                </Text>
                <Text style={[styles.description, { fontSize: fontSize.base, color: colors.text, lineHeight: 22 }]}>
                  {task.description}
                </Text>
              </View>
            )}

            <View style={[styles.section, { marginBottom: spacing.lg }]}>
              <Text style={[styles.sectionTitle, { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm }]}>
                DETAILS
              </Text>

              <View style={[styles.detailRow, { marginBottom: spacing.sm }]}>
                <MaterialCommunityIcons 
                  name={isOverdue() ? 'calendar-alert' : 'calendar'} 
                  size={18} 
                  color={dueDateColor} 
                />
                <Text style={[styles.detailLabel, { fontSize: fontSize.base, color: colors.text, marginLeft: spacing.sm }]}>
                  Due Date:
                </Text>
                <Text style={[styles.detailValue, { fontSize: fontSize.base, color: dueDateColor, marginLeft: spacing.sm, fontWeight: isOverdue() || isDueToday() ? '700' : '400' }]}>
                  {formatDate(task.dueDate)}
                </Text>
              </View>

              {getRecurrenceLabel() && (
                <View style={[styles.detailRow, { marginBottom: spacing.sm }]}>
                  <MaterialCommunityIcons name="repeat" size={18} color={colors.primary} />
                  <Text style={[styles.detailLabel, { fontSize: fontSize.base, color: colors.text, marginLeft: spacing.sm }]}>
                    Repeats:
                  </Text>
                  <Text style={[styles.detailValue, { fontSize: fontSize.base, color: colors.textSecondary, marginLeft: spacing.sm }]}>
                    {getRecurrenceLabel()}
                  </Text>
                </View>
              )}

              {task.reminderEnabled && (
                <View style={[styles.detailRow, { marginBottom: spacing.sm }]}>
                  <MaterialCommunityIcons name="bell" size={18} color={colors.primary} />
                  <Text style={[styles.detailLabel, { fontSize: fontSize.base, color: colors.text, marginLeft: spacing.sm }]}>
                    Reminder enabled
                  </Text>
                </View>
              )}
            </View>

            {task.subtasks && task.subtasks.length > 0 && (
              <View style={[styles.section, { marginBottom: spacing.lg }]}>
                <View style={[styles.subtaskHeader, { marginBottom: spacing.sm }]}>
                  <Text style={[styles.sectionTitle, { fontSize: fontSize.sm, color: colors.textSecondary }]}>
                    SUBTASKS
                  </Text>
                  <Text style={[styles.subtaskProgress, { fontSize: fontSize.sm, color: colors.primary }]}>
                    {subtaskProgress.completed} / {subtaskProgress.total}
                  </Text>
                </View>

                {subtaskProgress.total > 0 && (
                  <View
                    style={[
                      styles.progressBar,
                      {
                        backgroundColor: colors.backgroundTertiary,
                        borderRadius: borderRadius.sm,
                        height: 6,
                        marginBottom: spacing.md,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: colors.success,
                          borderRadius: borderRadius.sm,
                          height: '100%',
                          width: `${(subtaskProgress.completed / subtaskProgress.total) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                )}

                <SubtaskList taskId={task.id} subtasks={task.subtasks} editable={!task.completed} />
              </View>
            )}

            {!task.completed && (!task.subtasks || task.subtasks.length === 0) && (
              <View style={[styles.section, { marginBottom: spacing.lg }]}>
                <Text style={[styles.sectionTitle, { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm }]}>
                  SUBTASKS
                </Text>
                <SubtaskList taskId={task.id} subtasks={[]} editable />
              </View>
            )}
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
    alignItems: 'flex-start',
  },
  title: {
    fontWeight: '700',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  priorityBadge: {},
  priorityText: {
    fontWeight: '700',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontWeight: '700',
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overdueText: {
    fontWeight: '700',
  },
  dueTodayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueTodayText: {
    fontWeight: '700',
  },
  content: {
    maxHeight: 500,
  },
  section: {},
  sectionTitle: {
    fontWeight: '700',
  },
  description: {
    fontWeight: '400',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontWeight: '600',
  },
  detailValue: {
    fontWeight: '400',
  },
  subtaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtaskProgress: {
    fontWeight: '700',
  },
  progressBar: {
    overflow: 'hidden',
  },
  progressFill: {},
});
