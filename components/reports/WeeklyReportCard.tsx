import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { WeeklyReport } from '../../types/weeklyReport';

interface WeeklyReportCardProps {
  report: WeeklyReport;
  onPress?: () => void;
}

export function WeeklyReportCard({ report, onPress }: WeeklyReportCardProps) {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const getComparisonIcon = (change: number) => {
    if (change > 0) return { name: 'trending-up', color: colors.success };
    if (change < 0) return { name: 'trending-down', color: colors.error };
    return { name: 'trending-neutral', color: colors.textTertiary };
  };

  const maxDailyValue = Math.max(...report.dailyBreakdown.map((d) => d.total), 1);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          marginBottom: spacing.md,
        },
        shadows.sm,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { fontSize: fontSize.lg, color: colors.text }]}>
            Weekly Report
          </Text>
          <Text style={[styles.dateRange, { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs }]}>
            {formatDateRange(report.weekStart, report.weekEnd)}
          </Text>
        </View>
        {onPress && (
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textTertiary} />
        )}
      </View>

      {/* Stats Row */}
      <View style={[styles.statsRow, { marginTop: spacing.md }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { fontSize: fontSize.xxl, color: colors.primary }]}>
            {report.completedTasks}
          </Text>
          <Text style={[styles.statLabel, { fontSize: fontSize.xs, color: colors.textSecondary }]}>
            Completed
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { fontSize: fontSize.xxl, color: colors.text }]}>
            {report.totalTasks}
          </Text>
          <Text style={[styles.statLabel, { fontSize: fontSize.xs, color: colors.textSecondary }]}>
            Total Tasks
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { fontSize: fontSize.xxl, color: colors.success }]}>
            {Math.round(report.completionRate)}%
          </Text>
          <Text style={[styles.statLabel, { fontSize: fontSize.xs, color: colors.textSecondary }]}>
            Completion
          </Text>
        </View>
      </View>

      {/* Daily Chart */}
      <View style={[styles.chartContainer, { marginTop: spacing.md }]}>
        <Text style={[styles.chartTitle, { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm }]}>
          Daily Activity
        </Text>
        <View style={styles.chart}>
          {report.dailyBreakdown.map((day, index) => {
            const height = day.total > 0 ? (day.total / maxDailyValue) * 60 : 4;
            const completionPercentage = day.total > 0 ? (day.completed / day.total) * 100 : 0;

            return (
              <View key={index} style={styles.chartBar}>
                <View
                  style={[
                    styles.barBackground,
                    {
                      height,
                      backgroundColor: colors.backgroundTertiary,
                      borderRadius: borderRadius.sm,
                      overflow: 'hidden',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${completionPercentage}%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.dayLabel, { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing.xs }]}>
                  {day.day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Comparison */}
      {report.previousWeekComparison && (
        <View style={[styles.comparison, { marginTop: spacing.md, padding: spacing.sm, backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.md }]}>
          <View style={styles.comparisonItem}>
            <MaterialCommunityIcons
              name={getComparisonIcon(report.previousWeekComparison.completionRateChange).name as any}
              size={16}
              color={getComparisonIcon(report.previousWeekComparison.completionRateChange).color}
            />
            <Text style={[styles.comparisonText, { fontSize: fontSize.sm, color: colors.text, marginLeft: spacing.xs }]}>
              {Math.abs(Math.round(report.previousWeekComparison.completionRateChange))}% vs last week
            </Text>
          </View>
        </View>
      )}

      {/* Top Insight */}
      {report.insights.length > 0 && (
        <View style={[styles.insightContainer, { marginTop: spacing.md, padding: spacing.sm, backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.md }]}>
          <Text style={[styles.insight, { fontSize: fontSize.sm, color: colors.text }]}>
            {report.insights[0]}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
  },
  dateRange: {
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '700',
  },
  statLabel: {
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  chartContainer: {},
  chartTitle: {
    fontWeight: '600',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  barBackground: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
  },
  dayLabel: {
    fontWeight: '600',
  },
  comparison: {
    alignItems: 'center',
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comparisonText: {
    fontWeight: '600',
  },
  insightContainer: {},
  insight: {
    fontWeight: '500',
    lineHeight: 20,
  },
});
