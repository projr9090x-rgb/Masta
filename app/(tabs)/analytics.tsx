import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useTasks } from '../../hooks/useTasks';
import { useWeeklyReport } from '../../hooks/useWeeklyReport';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { WeeklyReportCard } from '../../components/reports/WeeklyReportCard';
import { WeeklyReportDetail } from '../../components/reports/WeeklyReportDetail';

export default function AnalyticsScreen() {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const { stats, tasks } = useTasks();
  const { currentReport, allReports, generateReport } = useWeeklyReport();
  const insets = useSafeAreaInsets();
  const [showReportDetail, setShowReportDetail] = useState(false);
  const [selectedReport, setSelectedReport] = useState(currentReport);

  const getPriorityBreakdown = () => {
    const high = tasks.filter((t) => t.priority === 'high' && !t.completed).length;
    const medium = tasks.filter((t) => t.priority === 'medium' && !t.completed).length;
    const low = tasks.filter((t) => t.priority === 'low' && !t.completed).length;
    return { high, medium, low };
  };

  const priorityBreakdown = getPriorityBreakdown();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.md }]}>
        <Text style={[styles.title, { fontSize: fontSize.hero, color: colors.text }]}>
          Analytics
        </Text>
      </View>

      <ScrollView style={{ padding: spacing.md }}>
        {/* Weekly Report Section */}
        {currentReport && (
          <View style={[styles.section, { marginBottom: spacing.md }]}>
            <View style={[styles.sectionHeader, { marginBottom: spacing.md }]}>
              <Text style={[styles.sectionTitle, { fontSize: fontSize.xl, color: colors.text }]}>
                This Week
              </Text>
              <TouchableOpacity onPress={() => generateReport()}>
                <MaterialCommunityIcons name="refresh" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <WeeklyReportCard
              report={currentReport}
              onPress={() => {
                setSelectedReport(currentReport);
                setShowReportDetail(true);
              }}
            />
          </View>
        )}

        {/* Historical Reports */}
        {allReports.length > 1 && (
          <View style={[styles.section, { marginBottom: spacing.md }]}>
            <Text style={[styles.sectionTitle, { fontSize: fontSize.xl, color: colors.text, marginBottom: spacing.md }]}>
              Past Reports
            </Text>
            {allReports.slice(1, 4).map((report) => (
              <WeeklyReportCard
                key={report.id}
                report={report}
                onPress={() => {
                  setSelectedReport(report);
                  setShowReportDetail(true);
                }}
              />
            ))}
          </View>
        )}

        <Text style={[styles.sectionTitle, { fontSize: fontSize.xl, color: colors.text, marginBottom: spacing.md }]}>
          Overall Stats
        </Text>
        <View style={[styles.progressCard, { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.md }, shadows.md]}>
          <Text style={[styles.cardTitle, { fontSize: fontSize.lg, color: colors.text, marginBottom: spacing.lg }]}>
            Overall Progress
          </Text>
          
          <View style={styles.progressContainer}>
            <ProgressRing progress={stats.completionRate} size={140} strokeWidth={14} />
            <View style={styles.progressCenter}>
              <Text style={[styles.progressValue, { fontSize: fontSize.hero, color: colors.text }]}>
                {Math.round(stats.completionRate)}%
              </Text>
              <Text style={[styles.progressLabel, { fontSize: fontSize.sm, color: colors.textSecondary }]}>
                Complete
              </Text>
            </View>
          </View>

          <View style={[styles.statsGrid, { marginTop: spacing.lg }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { fontSize: fontSize.xxl, color: colors.text }]}>
                {stats.total}
              </Text>
              <Text style={[styles.statLabel, { fontSize: fontSize.sm, color: colors.textSecondary }]}>
                Total
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { fontSize: fontSize.xxl, color: colors.success }]}>
                {stats.completed}
              </Text>
              <Text style={[styles.statLabel, { fontSize: fontSize.sm, color: colors.textSecondary }]}>
                Completed
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { fontSize: fontSize.xxl, color: colors.warning }]}>
                {stats.pending}
              </Text>
              <Text style={[styles.statLabel, { fontSize: fontSize.sm, color: colors.textSecondary }]}>
                Pending
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.priorityCard, { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md }, shadows.md]}>
          <Text style={[styles.cardTitle, { fontSize: fontSize.lg, color: colors.text, marginBottom: spacing.md }]}>
            Priority Breakdown
          </Text>

          <View style={[styles.priorityItem, { marginBottom: spacing.md }]}>
            <View style={styles.priorityLeft}>
              <View style={[styles.priorityDot, { backgroundColor: colors.priorityHigh }]} />
              <Text style={[styles.priorityText, { fontSize: fontSize.base, color: colors.text }]}>
                High Priority
              </Text>
            </View>
            <Text style={[styles.priorityCount, { fontSize: fontSize.base, color: colors.text }]}>
              {priorityBreakdown.high}
            </Text>
          </View>

          <View style={[styles.priorityItem, { marginBottom: spacing.md }]}>
            <View style={styles.priorityLeft}>
              <View style={[styles.priorityDot, { backgroundColor: colors.priorityMedium }]} />
              <Text style={[styles.priorityText, { fontSize: fontSize.base, color: colors.text }]}>
                Medium Priority
              </Text>
            </View>
            <Text style={[styles.priorityCount, { fontSize: fontSize.base, color: colors.text }]}>
              {priorityBreakdown.medium}
            </Text>
          </View>

          <View style={styles.priorityItem}>
            <View style={styles.priorityLeft}>
              <View style={[styles.priorityDot, { backgroundColor: colors.priorityLow }]} />
              <Text style={[styles.priorityText, { fontSize: fontSize.base, color: colors.text }]}>
                Low Priority
              </Text>
            </View>
            <Text style={[styles.priorityCount, { fontSize: fontSize.base, color: colors.text }]}>
              {priorityBreakdown.low}
            </Text>
          </View>
        </View>

        <View style={[styles.streakCard, { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md }, shadows.md]}>
          <View style={styles.streakHeader}>
            <MaterialCommunityIcons name="fire" size={32} color={colors.error} />
            <View style={{ marginLeft: spacing.md }}>
              <Text style={[styles.streakValue, { fontSize: fontSize.hero, color: colors.text }]}>
                {stats.streak} Days
              </Text>
              <Text style={[styles.streakLabel, { fontSize: fontSize.sm, color: colors.textSecondary }]}>
                Current Streak
              </Text>
            </View>
          </View>
          <Text style={[styles.streakDescription, { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.md }]}>
            Keep completing tasks daily to maintain your streak!
          </Text>
        </View>
      </ScrollView>

      <WeeklyReportDetail
        visible={showReportDetail}
        report={selectedReport}
        onClose={() => setShowReportDetail(false)}
      />
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
  progressCard: {
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: '700',
  },
  progressContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  progressValue: {
    fontWeight: '700',
  },
  progressLabel: {
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '700',
  },
  statLabel: {
    fontWeight: '500',
  },
  priorityCard: {},
  priorityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  priorityText: {
    fontWeight: '500',
  },
  priorityCount: {
    fontWeight: '700',
  },
  streakCard: {},
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakValue: {
    fontWeight: '700',
  },
  streakLabel: {
    fontWeight: '500',
  },
  streakDescription: {
    fontWeight: '400',
  },
  section: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
  },
});
