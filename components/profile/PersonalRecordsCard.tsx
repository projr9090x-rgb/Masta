import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { PersonalRecord } from '../../types/personalRecords';

interface PersonalRecordsCardProps {
  records: PersonalRecord | null;
}

export function PersonalRecordsCard({ records }: PersonalRecordsCardProps) {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();

  if (!records) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not yet';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const recordItems = [
    {
      icon: 'fire',
      color: colors.error,
      label: 'Longest Streak',
      value: records.longestStreak > 0 ? `${records.longestStreak} days` : '-',
      date: formatDate(records.longestStreakDate),
    },
    {
      icon: 'calendar-star',
      color: colors.primary,
      label: 'Most Tasks (Day)',
      value: records.mostTasksOneDay > 0 ? `${records.mostTasksOneDay} tasks` : '-',
      date: formatDate(records.mostTasksOneDayDate),
    },
    {
      icon: 'calendar-month',
      color: colors.success,
      label: 'Most Tasks (Week)',
      value: records.mostTasksOneWeek > 0 ? `${records.mostTasksOneWeek} tasks` : '-',
      date: formatDate(records.mostTasksOneWeekDate),
    },
    {
      icon: 'star-circle',
      color: colors.warning,
      label: 'Highest XP (Day)',
      value: records.highestXpOneDay > 0 ? `${records.highestXpOneDay} XP` : '-',
      date: formatDate(records.highestXpOneDayDate),
    },
    {
      icon: 'chart-line',
      color: colors.info,
      label: 'Best Completion %',
      value: records.bestCompletionRateWeek > 0 ? `${Math.round(records.bestCompletionRateWeek)}%` : '-',
      date: formatDate(records.bestCompletionRateWeekDate),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md }, shadows.md]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="trophy" size={24} color={colors.warning} />
        <Text style={[styles.title, { fontSize: fontSize.lg, color: colors.text, marginLeft: spacing.sm }]}>
          Personal Records
        </Text>
      </View>

      <View style={[styles.recordsList, { marginTop: spacing.md }]}>
        {recordItems.map((item, index) => (
          <View
            key={index}
            style={[
              styles.recordItem,
              {
                paddingVertical: spacing.sm,
                borderBottomWidth: index < recordItems.length - 1 ? 1 : 0,
                borderBottomColor: colors.divider,
              },
            ]}
          >
            <View style={styles.recordIcon}>
              <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
            </View>

            <View style={styles.recordInfo}>
              <Text style={[styles.recordLabel, { fontSize: fontSize.sm, color: colors.textSecondary }]}>
                {item.label}
              </Text>
              <Text style={[styles.recordDate, { fontSize: fontSize.xs, color: colors.textTertiary }]}>
                {item.date}
              </Text>
            </View>

            <Text style={[styles.recordValue, { fontSize: fontSize.base, color: colors.text }]}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
  },
  recordsList: {},
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recordLabel: {
    fontWeight: '600',
  },
  recordDate: {
    fontWeight: '500',
    marginTop: 2,
  },
  recordValue: {
    fontWeight: '700',
  },
});
