import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useTasks } from '../../hooks/useTasks';
import { TaskItem } from '../../components/tasks/TaskItem';

export default function CalendarScreen() {
  const { colors, spacing, fontSize, borderRadius } = useTheme();
  const { tasks } = useTasks();
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const getMarkedDates = () => {
    const marked: { [key: string]: any } = {};

    tasks.forEach((task) => {
      if (task.dueDate) {
        const date = new Date(task.dueDate).toISOString().split('T')[0];
        if (!marked[date]) {
          marked[date] = { marked: true, dots: [] };
        }
        
        const dotColor = task.completed ? colors.success : 
          task.priority === 'high' ? colors.priorityHigh :
          task.priority === 'medium' ? colors.priorityMedium :
          colors.priorityLow;
        
        marked[date].dots.push({ color: dotColor });
      }
    });

    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: colors.primary,
    };

    return marked;
  };

  const getTasksForSelectedDate = () => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === selectedDate;
    });
  };

  const selectedTasks = getTasksForSelectedDate();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.md }]}>
        <Text style={[styles.title, { fontSize: fontSize.hero, color: colors.text }]}>
          Calendar
        </Text>
      </View>

      <ScrollView>
        <View style={{ padding: spacing.md }}>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={getMarkedDates()}
            markingType="multi-dot"
            theme={{
              backgroundColor: colors.card,
              calendarBackground: colors.card,
              textSectionTitleColor: colors.textSecondary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: '#FFF',
              todayTextColor: colors.primary,
              dayTextColor: colors.text,
              textDisabledColor: colors.textTertiary,
              dotColor: colors.primary,
              selectedDotColor: '#FFF',
              arrowColor: colors.primary,
              monthTextColor: colors.text,
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              textDayFontSize: fontSize.base,
              textMonthFontSize: fontSize.lg,
              textDayHeaderFontSize: fontSize.sm,
            }}
            style={[
              styles.calendar,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.lg,
                padding: spacing.sm,
              },
            ]}
          />

          <View style={[styles.tasksSection, { marginTop: spacing.lg }]}>
            <Text style={[styles.sectionTitle, { fontSize: fontSize.lg, color: colors.text, marginBottom: spacing.md }]}>
              Tasks for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </Text>

            {selectedTasks.length > 0 ? (
              selectedTasks.map((task) => (
                <TaskItem key={task.id} task={task} onPress={() => {}} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="calendar-blank"
                  size={48}
                  color={colors.textTertiary}
                />
                <Text style={[styles.emptyText, { fontSize: fontSize.base, color: colors.textSecondary, marginTop: spacing.md }]}>
                  No tasks scheduled for this day
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
  },
  title: {
    fontWeight: '700',
  },
  calendar: {
    elevation: 4,
  },
  tasksSection: {},
  sectionTitle: {
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontWeight: '500',
  },
});
