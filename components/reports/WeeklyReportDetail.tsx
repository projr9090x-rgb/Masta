import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { WeeklyReport } from '../../types/weeklyReport';

interface WeeklyReportDetailProps {
  visible: boolean;
  report: WeeklyReport | null;
  onClose: () => void;
}

export function WeeklyReportDetail({ visible, report, onClose }: WeeklyReportDetailProps) {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();

  if (!report) return null;

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
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
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                paddingHorizontal: spacing.md,
                paddingTop: spacing.md,
                paddingBottom: spacing.sm,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
              },
            ]}
          >
            <View>
              <Text style={[styles.headerTitle, { fontSize: fontSize.xl, color: colors.text }]}>
                Weekly Report
              </Text>
              <Text
                style={[
                  styles.headerSubtitle,
                  { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
                ]}
              >
                {formatDateRange(report.weekStart, report.weekEnd)}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={[styles.content, { padding: spacing.md }]}>
            {/* Summary Stats */}
            <View style={[styles.section, { marginBottom: spacing.lg }]}>
              <Text
                style={[
                  styles.sectionTitle,
                  { fontSize: fontSize.lg, color: colors.text, marginBottom: spacing.md },
                ]}
              >
                Summary
              </Text>
              <View style={styles.summaryGrid}>
                <View style={[styles.summaryCard, { backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.md, padding: spacing.md, flex: 1, marginRight: spacing.sm }]}>
                  <MaterialCommunityIcons name="checkbox-marked-circle" size={24} color={colors.success} />
                  <Text style={[styles.summaryValue, { fontSize: fontSize.xxl, color: colors.text, marginTop: spacing.xs }]}>
                    {report.completedTasks}
                  </Text>
                  <Text style={[styles.summaryLabel, { fontSize: fontSize.xs, color: colors.textSecondary }]}>
                    Completed
                  </Text>
                </View>

                <View style={[styles.summaryCard, { backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.md, padding: spacing.md, flex: 1, marginLeft: spacing.sm }]}>
                  <MaterialCommunityIcons name="playlist-check" size={24} color={colors.primary} />
                  <Text style={[styles.summaryValue, { fontSize: fontSize.xxl, color: colors.text, marginTop: spacing.xs }]}>
                    {report.totalTasks}
                  </Text>
                  <Text style={[styles.summaryLabel, { fontSize: fontSize.xs, color: colors.textSecondary }]}>
                    Total Tasks
                  </Text>
                </View>
              </View>

              <View style={[styles.summaryGrid, { marginTop: spacing.sm }]}>
                <View style={[styles.summaryCard, { backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.md, padding: spacing.md, flex: 1, marginRight: spacing.sm }]}>
                  <MaterialCommunityIcons name="chart-arc" size={24} color={colors.warning} />
                  <Text style={[styles.summaryValue, { fontSize: fontSize.xxl, color: colors.text, marginTop: spacing.xs }]}>
                    {Math.round(report.completionRate)}%
                  </Text>
                  <Text style={[styles.summaryLabel, { fontSize: fontSize.xs, color: colors.textSecondary }]}>
                    Completion Rate
                  </Text>
                </View>

                <View style={[styles.summaryCard, { backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.md, padding: spacing.md, flex: 1, marginLeft: spacing.sm }]}>
                  <MaterialCommunityIcons name="clock-alert-outline" size={24} color={colors.error} />
                  <Text style={[styles.summaryValue, { fontSize: fontSize.xxl, color: colors.text, marginTop: spacing.xs }]}>
                    {report.incompleteTasks}
                  </Text>
                  <Text style={[styles.summaryLabel, { fontSize: fontSize.xs, color: colors.textSecondary }]}>
                    Incomplete
                  </Text>
                </View>
              </View>
            </View>

            {/* Insights */}
            {report.insights.length > 0 && (
              <View style={[styles.section, { marginBottom: spacing.lg }]}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { fontSize: fontSize.lg, color: colors.text, marginBottom: spacing.md },
                  ]}
                >
                  Insights
                </Text>
                {report.insights.map((insight, index) => (
                  <View
                    key={index}
                    style={[
                      styles.insightCard,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderRadius: borderRadius.md,
                        padding: spacing.md,
                        marginBottom: spacing.sm,
                      },
                    ]}
                  >
                    <Text style={[styles.insightText, { fontSize: fontSize.base, color: colors.text }]}>
                      {insight}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Daily Breakdown */}
            <View style={[styles.section, { marginBottom: spacing.lg }]}>
              <Text
                style={[
                  styles.sectionTitle,
                  { fontSize: fontSize.lg, color: colors.text, marginBottom: spacing.md },
                ]}
              >
                Daily Breakdown
              </Text>
              {report.dailyBreakdown.map((day, index) => (
                <View
                  key={index}
                  style={[
                    styles.dayRow,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderRadius: borderRadius.md,
                      padding: spacing.md,
                      marginBottom: spacing.sm,
                    },
                  ]}
                >
                  <View style={styles.dayInfo}>
                    <Text style={[styles.dayName, { fontSize: fontSize.base, color: colors.text }]}>
                      {day.day}
                    </Text>
                    <Text
                      style={[
                        styles.dayStats,
                        { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
                      ]}
                    >
                      {day.completed} / {day.total} completed
                    </Text>
                  </View>
                  {day.total > 0 && (
                    <View style={styles.dayProgress}>
                      <Text style={[styles.dayPercentage, { fontSize: fontSize.sm, color: colors.primary }]}>
                        {Math.round((day.completed / day.total) * 100)}%
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Category Breakdown */}
            {report.categoryBreakdown.length > 0 && (
              <View style={[styles.section, { marginBottom: spacing.lg }]}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { fontSize: fontSize.lg, color: colors.text, marginBottom: spacing.md },
                  ]}
                >
                  By Category
                </Text>
                {report.categoryBreakdown.map((category, index) => (
                  <View
                    key={index}
                    style={[
                      styles.categoryRow,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderRadius: borderRadius.md,
                        padding: spacing.md,
                        marginBottom: spacing.sm,
                      },
                    ]}
                  >
                    <View style={styles.categoryInfo}>
                      <View style={styles.categoryHeader}>
                        <View
                          style={[
                            styles.categoryDot,
                            { width: 12, height: 12, borderRadius: 6, backgroundColor: category.categoryColor },
                          ]}
                        />
                        <Text style={[styles.categoryName, { fontSize: fontSize.base, color: colors.text, marginLeft: spacing.sm }]}>
                          {category.categoryName}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.categoryStats,
                          { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
                        ]}
                      >
                        {category.completed} / {category.total} tasks
                      </Text>
                    </View>
                    <Text style={[styles.categoryPercentage, { fontSize: fontSize.sm, color: colors.primary }]}>
                      {Math.round(category.completionRate)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Productive Days */}
            {(report.mostProductiveDay || report.leastProductiveDay) && (
              <View style={[styles.section, { marginBottom: spacing.lg }]}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { fontSize: fontSize.lg, color: colors.text, marginBottom: spacing.md },
                  ]}
                >
                  Productivity Highlights
                </Text>
                {report.mostProductiveDay && (
                  <View style={[styles.highlightCard, { backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm }]}>
                    <MaterialCommunityIcons name="trophy" size={20} color={colors.warning} />
                    <Text style={[styles.highlightText, { fontSize: fontSize.base, color: colors.text, marginLeft: spacing.sm }]}>
                      Most productive: {report.mostProductiveDay}
                    </Text>
                  </View>
                )}
                {report.leastProductiveDay && (
                  <View style={[styles.highlightCard, { backgroundColor: colors.backgroundSecondary, borderRadius: borderRadius.md, padding: spacing.md }]}>
                    <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={colors.info} />
                    <Text style={[styles.highlightText, { fontSize: fontSize.base, color: colors.text, marginLeft: spacing.sm }]}>
                      Room to improve: {report.leastProductiveDay}
                    </Text>
                  </View>
                )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerSubtitle: {
    fontWeight: '500',
  },
  content: {
    maxHeight: 600,
  },
  section: {},
  sectionTitle: {
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
  },
  summaryCard: {
    alignItems: 'center',
  },
  summaryValue: {
    fontWeight: '700',
  },
  summaryLabel: {
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  insightCard: {},
  insightText: {
    fontWeight: '500',
    lineHeight: 22,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontWeight: '600',
  },
  dayStats: {
    fontWeight: '500',
  },
  dayProgress: {},
  dayPercentage: {
    fontWeight: '700',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {},
  categoryName: {
    fontWeight: '600',
  },
  categoryStats: {
    fontWeight: '500',
  },
  categoryPercentage: {
    fontWeight: '700',
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightText: {
    fontWeight: '600',
  },
});
