import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../hooks/useTheme';
import { useTasks } from '../../hooks/useTasks';
import { useCategories } from '../../hooks/useCategories';
import { Priority, RecurrenceType } from '../../types/task';
import { useAlert } from '../../template';
import { useSettings } from '../../hooks/useSettings';
import { notificationService } from '../../services/notificationService';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddTaskModal({ visible, onClose }: AddTaskModalProps) {
  const { colors, spacing, fontSize, borderRadius } = useTheme();
  const { addTask } = useTasks();
  const { categories } = useCategories();
  const { showAlert } = useAlert();
  const { settings } = useSettings();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showQuickDateOptions, setShowQuickDateOptions] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(undefined);
  const [showRecurrenceEndPicker, setShowRecurrenceEndPicker] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(undefined);
    setReminderEnabled(false);
    setCategoryId(undefined);
    setRecurrenceType('none');
    setRecurrenceInterval(1);
    setRecurrenceDays([]);
    setRecurrenceEndDate(undefined);
    setShowQuickDateOptions(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showAlert('Error', 'Please enter a task title');
      return;
    }

    // Validate reminder requires due date
    if (reminderEnabled && !dueDate) {
      showAlert('Due Date Required', 'Please set a due date to enable reminders.');
      return;
    }

    // Validate recurrence requires due date
    if (recurrenceType !== 'none' && !dueDate) {
      showAlert('Due Date Required', 'Please set a due date for recurring tasks.');
      return;
    }

    try {
      const newTask = await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate?.toISOString(),
        reminderEnabled,
        reminderTime: reminderEnabled && dueDate ? dueDate.toISOString() : undefined,
        categoryId: categoryId || undefined,
        recurrenceType,
        recurrenceInterval: recurrenceType !== 'none' ? recurrenceInterval : undefined,
        recurrenceDays: recurrenceType === 'custom' ? recurrenceDays : undefined,
        recurrenceEndDate: recurrenceType !== 'none' ? recurrenceEndDate?.toISOString() : undefined,
        isRecurringParent: recurrenceType !== 'none',
      });

      // Schedule notification if reminders are enabled
      if (reminderEnabled && settings.notificationsEnabled && dueDate) {
        const notificationId = await notificationService.scheduleTaskReminder(newTask, settings.reminderTime);
        if (notificationId) {
          // Update task with notification ID
          await addTask({
            ...newTask,
            notificationId,
          });
        }
      }

      resetForm();
      onClose();
    } catch (error) {
      showAlert('Error', 'Failed to create task. Please try again.');
      console.error('Error creating task:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleQuickDateSelect = (option: 'today' | 'tomorrow' | 'next-week' | 'custom') => {
    const now = new Date();
    let selected: Date;

    switch (option) {
      case 'today':
        selected = new Date();
        selected.setHours(9, 0, 0, 0);
        break;
      case 'tomorrow':
        selected = new Date();
        selected.setDate(selected.getDate() + 1);
        selected.setHours(9, 0, 0, 0);
        break;
      case 'next-week':
        selected = new Date();
        selected.setDate(selected.getDate() + 7);
        selected.setHours(9, 0, 0, 0);
        break;
      case 'custom':
        setShowQuickDateOptions(false);
        setShowDatePicker(true);
        return;
    }

    setDueDate(selected);
    setShowQuickDateOptions(false);
  };

  const handleClearDueDate = () => {
    showAlert(
      'Clear Due Date',
      'Are you sure you want to remove the due date? This will also disable reminders and recurrence.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setDueDate(undefined);
            setReminderEnabled(false);
            setRecurrenceType('none');
          },
        },
      ]
    );
  };

  const formatDueDate = (date: Date) => {
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
    if (isPast) return `⚠️ ${dateStr}, ${timeStr}`;
    return `${dateStr}, ${timeStr}`;
  };

  const handleRecurrenceChange = () => {
    showAlert(
      'Repeat Task',
      'Choose how often this task should repeat',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Never', onPress: () => setRecurrenceType('none') },
        { text: 'Daily', onPress: () => { setRecurrenceType('daily'); setRecurrenceInterval(1); } },
        { text: 'Weekly', onPress: () => { setRecurrenceType('weekly'); setRecurrenceInterval(1); } },
        { text: 'Monthly', onPress: () => { setRecurrenceType('monthly'); setRecurrenceInterval(1); } },
        { text: 'Custom Days', onPress: () => setRecurrenceType('custom') },
      ]
    );
  };

  const toggleRecurrenceDay = (day: number) => {
    setRecurrenceDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => a - b)
    );
  };

  const getRecurrenceLabel = () => {
    if (recurrenceType === 'none') return 'Never';
    if (recurrenceType === 'daily') return recurrenceInterval === 1 ? 'Daily' : `Every ${recurrenceInterval} days`;
    if (recurrenceType === 'weekly') return recurrenceInterval === 1 ? 'Weekly' : `Every ${recurrenceInterval} weeks`;
    if (recurrenceType === 'monthly') return recurrenceInterval === 1 ? 'Monthly' : `Every ${recurrenceInterval} months`;
    if (recurrenceType === 'custom') {
      if (recurrenceDays.length === 0) return 'Select days';
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return recurrenceDays.map(d => dayNames[d]).join(', ');
    }
    return 'Never';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <View style={[styles.modalContent, { backgroundColor: colors.card, borderRadius: borderRadius.lg }]}>
          <View style={[styles.header, { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm }]}>
            <Text style={[styles.headerTitle, { fontSize: fontSize.xl, color: colors.text }]}>
              New Task
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={[styles.form, { padding: spacing.md }]}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  fontSize: fontSize.base,
                  color: colors.text,
                  marginBottom: spacing.md,
                },
              ]}
              placeholder="Task title"
              placeholderTextColor={colors.textTertiary}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  fontSize: fontSize.base,
                  color: colors.text,
                  marginBottom: spacing.md,
                  minHeight: 100,
                },
              ]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={[styles.label, { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm }]}>
              Category
            </Text>
            <View style={[styles.categorySelector, { marginBottom: spacing.md }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    {
                      backgroundColor: !categoryId ? colors.primary : colors.backgroundSecondary,
                      borderRadius: borderRadius.md,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      marginRight: spacing.sm,
                      borderWidth: !categoryId ? 0 : 1,
                      borderColor: colors.divider,
                    },
                  ]}
                  onPress={() => setCategoryId(undefined)}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      {
                        fontSize: fontSize.sm,
                        color: !categoryId ? '#FFF' : colors.text,
                      },
                    ]}
                  >
                    None
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryOption,
                        {
                          backgroundColor: isSelected ? cat.color : colors.backgroundSecondary,
                          borderRadius: borderRadius.md,
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.sm,
                          marginRight: spacing.sm,
                          borderWidth: isSelected ? 0 : 1,
                          borderColor: colors.divider,
                        },
                      ]}
                      onPress={() => setCategoryId(cat.id)}
                    >
                      {cat.icon && (
                        <MaterialCommunityIcons
                          name={cat.icon as any}
                          size={14}
                          color={isSelected ? '#FFF' : cat.color}
                          style={{ marginRight: spacing.xs }}
                        />
                      )}
                      <Text
                        style={[
                          styles.categoryOptionText,
                          {
                            fontSize: fontSize.sm,
                            color: isSelected ? '#FFF' : colors.text,
                          },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <Text style={[styles.label, { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm }]}>
              Priority
            </Text>
            <View style={[styles.priorityContainer, { marginBottom: spacing.md }]}>
              {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    {
                      backgroundColor: priority === p ? colors.primary : colors.backgroundSecondary,
                      borderRadius: borderRadius.md,
                      padding: spacing.md,
                      flex: 1,
                      marginHorizontal: spacing.xs,
                    },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      {
                        fontSize: fontSize.sm,
                        color: priority === p ? '#FFF' : colors.text,
                      },
                    ]}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor: dueDate ? colors.primary + '20' : colors.backgroundSecondary,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                  borderWidth: dueDate ? 1 : 0,
                  borderColor: dueDate ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => setShowQuickDateOptions(true)}
            >
              <MaterialCommunityIcons 
                name="calendar" 
                size={20} 
                color={dueDate ? colors.primary : colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.dateButtonText, 
                  { 
                    fontSize: fontSize.base, 
                    color: dueDate ? colors.primary : colors.text, 
                    marginLeft: spacing.sm,
                    flex: 1,
                  }
                ]}
              >
                {dueDate ? formatDueDate(dueDate) : 'Set due date'}
              </Text>
              {dueDate && (
                <TouchableOpacity onPress={handleClearDueDate}>
                  <MaterialCommunityIcons name="close-circle" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {/* Quick Date Options Modal */}
            {showQuickDateOptions && (
              <View
                style={[
                  styles.quickDateOptions,
                  {
                    backgroundColor: colors.card,
                    borderRadius: borderRadius.md,
                    padding: spacing.sm,
                    marginBottom: spacing.md,
                    borderWidth: 1,
                    borderColor: colors.divider,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.quickDateOption,
                    {
                      padding: spacing.md,
                      borderRadius: borderRadius.sm,
                      backgroundColor: colors.backgroundSecondary,
                      marginBottom: spacing.xs,
                    },
                  ]}
                  onPress={() => handleQuickDateSelect('today')}
                >
                  <MaterialCommunityIcons name="calendar-today" size={20} color={colors.primary} />
                  <Text style={[styles.quickDateText, { fontSize: fontSize.base, color: colors.text, marginLeft: spacing.sm }]}>
                    Today, 9:00 AM
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.quickDateOption,
                    {
                      padding: spacing.md,
                      borderRadius: borderRadius.sm,
                      backgroundColor: colors.backgroundSecondary,
                      marginBottom: spacing.xs,
                    },
                  ]}
                  onPress={() => handleQuickDateSelect('tomorrow')}
                >
                  <MaterialCommunityIcons name="calendar-arrow-right" size={20} color={colors.primary} />
                  <Text style={[styles.quickDateText, { fontSize: fontSize.base, color: colors.text, marginLeft: spacing.sm }]}>
                    Tomorrow, 9:00 AM
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.quickDateOption,
                    {
                      padding: spacing.md,
                      borderRadius: borderRadius.sm,
                      backgroundColor: colors.backgroundSecondary,
                      marginBottom: spacing.xs,
                    },
                  ]}
                  onPress={() => handleQuickDateSelect('next-week')}
                >
                  <MaterialCommunityIcons name="calendar-week" size={20} color={colors.primary} />
                  <Text style={[styles.quickDateText, { fontSize: fontSize.base, color: colors.text, marginLeft: spacing.sm }]}>
                    Next Week, 9:00 AM
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.quickDateOption,
                    {
                      padding: spacing.md,
                      borderRadius: borderRadius.sm,
                      backgroundColor: colors.backgroundSecondary,
                    },
                  ]}
                  onPress={() => handleQuickDateSelect('custom')}
                >
                  <MaterialCommunityIcons name="calendar-edit" size={20} color={colors.primary} />
                  <Text style={[styles.quickDateText, { fontSize: fontSize.base, color: colors.text, marginLeft: spacing.sm }]}>
                    Pick Custom Date & Time
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.quickDateCancel,
                    {
                      padding: spacing.sm,
                      marginTop: spacing.sm,
                      alignItems: 'center',
                    },
                  ]}
                  onPress={() => setShowQuickDateOptions(false)}
                >
                  <Text style={[{ fontSize: fontSize.sm, color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate && event.type === 'set') {
                    // Set time to 9:00 AM by default
                    const dateWithTime = new Date(selectedDate);
                    dateWithTime.setHours(9, 0, 0, 0);
                    setDueDate(dateWithTime);
                    // Show time picker after date selection
                    setTimeout(() => setShowTimePicker(true), 100);
                  }
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime && event.type === 'set' && dueDate) {
                    const newDate = new Date(dueDate);
                    newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
                    setDueDate(newDate);
                  }
                }}
              />
            )}

            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                },
              ]}
              onPress={handleRecurrenceChange}
            >
              <MaterialCommunityIcons name="repeat" size={20} color={colors.primary} />
              <Text style={[styles.dateButtonText, { fontSize: fontSize.base, color: colors.text, marginLeft: spacing.sm }]}>
                Repeat: {getRecurrenceLabel()}
              </Text>
            </TouchableOpacity>

            {recurrenceType === 'custom' && (
              <View style={[styles.customDaysContainer, { marginBottom: spacing.md }]}>
                <Text style={[styles.label, { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm }]}>
                  Select Days
                </Text>
                <View style={styles.daysRow}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        {
                          backgroundColor: recurrenceDays.includes(index) ? colors.primary : colors.backgroundSecondary,
                          borderRadius: borderRadius.md,
                          padding: spacing.sm,
                          minWidth: 40,
                          alignItems: 'center',
                          marginRight: spacing.xs,
                        },
                      ]}
                      onPress={() => toggleRecurrenceDay(index)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          {
                            fontSize: fontSize.sm,
                            color: recurrenceDays.includes(index) ? '#FFF' : colors.text,
                          },
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {recurrenceType !== 'none' && (
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                  },
                ]}
                onPress={() => setShowRecurrenceEndPicker(true)}
              >
                <MaterialCommunityIcons name="calendar-end" size={20} color={colors.primary} />
                <Text style={[styles.dateButtonText, { fontSize: fontSize.base, color: colors.text, marginLeft: spacing.sm }]}>
                  {recurrenceEndDate ? `Ends: ${recurrenceEndDate.toLocaleDateString()}` : 'Repeat forever'}
                </Text>
                {recurrenceEndDate && (
                  <TouchableOpacity onPress={() => setRecurrenceEndDate(undefined)} style={{ marginLeft: 'auto' }}>
                    <MaterialCommunityIcons name="close-circle" size={20} color={colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            )}

            {showRecurrenceEndPicker && (
              <DateTimePicker
                value={recurrenceEndDate || new Date()}
                mode="date"
                display="default"
                minimumDate={dueDate || new Date()}
                onChange={(event, selectedDate) => {
                  setShowRecurrenceEndPicker(false);
                  if (selectedDate) {
                    setRecurrenceEndDate(selectedDate);
                  }
                }}
              />
            )}

            <TouchableOpacity
              style={[styles.reminderContainer, { marginBottom: spacing.md }]}
              onPress={() => setReminderEnabled(!reminderEnabled)}
            >
              <View style={styles.reminderLeft}>
                <MaterialCommunityIcons
                  name={reminderEnabled ? 'bell' : 'bell-outline'}
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.reminderText, { fontSize: fontSize.base, color: colors.text, marginLeft: spacing.sm }]}>
                  Enable reminder
                </Text>
              </View>
              <View
                style={[
                  styles.toggle,
                  {
                    backgroundColor: reminderEnabled ? colors.primary : colors.backgroundTertiary,
                    borderRadius: borderRadius.round,
                  },
                ]}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    {
                      backgroundColor: '#FFF',
                      transform: [{ translateX: reminderEnabled ? 18 : 0 }],
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </ScrollView>

          <View style={[styles.footer, { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider }]}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: colors.primary,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                },
              ]}
              onPress={handleSubmit}
            >
              <Text style={[styles.submitButtonText, { fontSize: fontSize.base, color: '#FFF' }]}>
                Create Task
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  headerTitle: {
    fontWeight: '700',
  },
  form: {
    maxHeight: 500,
  },
  input: {
    fontWeight: '400',
  },
  textArea: {
    textAlignVertical: 'top',
  },
  label: {
    fontWeight: '600',
  },
  priorityContainer: {
    flexDirection: 'row',
  },
  priorityButton: {
    alignItems: 'center',
  },
  priorityText: {
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButtonText: {
    fontWeight: '500',
  },
  quickDateOptions: {},
  quickDateOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickDateText: {
    fontWeight: '600',
  },
  quickDateCancel: {},
  reminderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderText: {
    fontWeight: '500',
  },
  toggle: {
    width: 44,
    height: 24,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  customDaysContainer: {},
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {},
  dayText: {
    fontWeight: '600',
  },
  categorySelector: {},
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryOptionText: {
    fontWeight: '600',
  },
  footer: {
    paddingTop: 0,
  },
  submitButton: {
    alignItems: 'center',
  },
  submitButtonText: {
    fontWeight: '700',
  },
});
