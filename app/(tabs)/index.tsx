import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useTasks } from '../../hooks/useTasks';
import { useCategories } from '../../hooks/useCategories';
import { useCalendarSync } from '../../hooks/useCalendarSync';
import { useGamification } from '../../hooks/useGamification';
import { useSettings } from '../../hooks/useSettings';
import { CelebrationModal } from '../../components/gamification/CelebrationModal';
import { TaskItem } from '../../components/tasks/TaskItem';
import { AddTaskModal } from '../../components/tasks/AddTaskModal';
import { TaskDetailModal } from '../../components/tasks/TaskDetailModal';
import { CategoryPicker } from '../../components/categories/CategoryPicker';
import { CategoryManager } from '../../components/categories/CategoryManager';
import { HelpBotModal } from '../../components/help/HelpBotModal';
import { FeedbackModal } from '../../components/help/FeedbackModal';
import { FloatingHelpButton } from '../../components/help/FloatingHelpButton';
import { Task } from '../../types/task';

type FilterType = 'all' | 'pending' | 'completed';

export default function TasksScreen() {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const { tasks, stats, loading } = useTasks();
  const { categories } = useCategories();
  const { celebrationQueue, dismissCelebration } = useGamification();
  const { settings } = useSettings();
  const insets = useSafeAreaInsets();
  
  // Auto-sync tasks to calendar when enabled
  useCalendarSync();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showHelpBot, setShowHelpBot] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Memoize filtered and sorted tasks to prevent recalculation on every render
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filter by completion status
      if (filter === 'pending' && task.completed) return false;
      if (filter === 'completed' && !task.completed) return false;
      
      // Filter by category
      if (selectedCategoryId && task.categoryId !== selectedCategoryId) return false;
      
      return true;
    }).sort((a, b) => {
      // Sort by completed status first, then by due date
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks, filter, selectedCategoryId]);

  // Memoize callbacks to prevent re-creating functions
  const handleTaskPress = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  const handleFilterChange = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
  }, []);

  const handleCategoryChange = useCallback((categoryId: string | undefined) => {
    setSelectedCategoryId(categoryId);
  }, []);

  // Memoize header to prevent re-render when tasks change
  const renderHeader = useMemo(() => (
    <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.greeting, { fontSize: fontSize.hero, color: colors.text }]}>
          My Tasks
        </Text>
        <Text style={[styles.subtitle, { fontSize: fontSize.base, color: colors.textSecondary, marginTop: spacing.xs }]}>
          {stats.pending} pending, {stats.completed} completed
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setShowCategoryManager(true)}
        style={[
          styles.manageButton,
          {
            backgroundColor: colors.backgroundSecondary,
            borderRadius: borderRadius.md,
            padding: spacing.sm,
          },
        ]}
      >
        <MaterialCommunityIcons name="folder-cog-outline" size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  ), [colors, spacing, fontSize, borderRadius, insets.top, stats.pending, stats.completed]);

  // Memoize stats to prevent re-render
  const renderStats = useMemo(() => (
    <View style={[styles.statsContainer, { marginTop: spacing.md, marginBottom: spacing.lg }]}>
      <View style={[styles.statCard, { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, flex: 1, marginRight: spacing.sm }, shadows.sm]}>
        <MaterialCommunityIcons name="fire" size={24} color={colors.error} />
        <Text style={[styles.statValue, { fontSize: fontSize.xxl, color: colors.text, marginTop: spacing.xs }]}>
          {stats.streak}
        </Text>
        <Text style={[styles.statLabel, { fontSize: fontSize.xs, color: colors.textSecondary }]}>
          Day Streak
        </Text>
      </View>

      <View style={[styles.statCard, { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, flex: 1, marginLeft: spacing.sm }, shadows.sm]}>
        <MaterialCommunityIcons name="chart-line" size={24} color={colors.success} />
        <Text style={[styles.statValue, { fontSize: fontSize.xxl, color: colors.text, marginTop: spacing.xs }]}>
          {Math.round(stats.completionRate)}%
        </Text>
        <Text style={[styles.statLabel, { fontSize: fontSize.xs, color: colors.textSecondary }]}>
          Completion
        </Text>
      </View>
    </View>
  ), [colors, spacing, fontSize, borderRadius, shadows, stats.streak, stats.completionRate]);

  // Memoize filters to prevent re-render
  const renderFilters = useMemo(() => (
    <>
      <View style={[styles.filterContainer, { marginBottom: spacing.sm }]}>
        {(['all', 'pending', 'completed'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              {
                backgroundColor: filter === f ? colors.primary : colors.backgroundSecondary,
                borderRadius: borderRadius.md,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                marginRight: spacing.sm,
              },
            ]}
            onPress={() => handleFilterChange(f)}
          >
            <Text
              style={[
                styles.filterText,
                {
                  fontSize: fontSize.sm,
                  color: filter === f ? '#FFF' : colors.text,
                },
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <CategoryPicker
        selectedCategoryId={selectedCategoryId}
        onSelect={handleCategoryChange}
        showNone
      />
    </>
  ), [colors, spacing, fontSize, borderRadius, filter, selectedCategoryId, handleFilterChange, handleCategoryChange]);

  // Memoize empty state
  const renderEmpty = useMemo(() => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="checkbox-marked-circle-outline"
        size={64}
        color={colors.textTertiary}
      />
      <Text style={[styles.emptyText, { fontSize: fontSize.lg, color: colors.textSecondary, marginTop: spacing.md }]}>
        No tasks yet
      </Text>
      <Text style={[styles.emptySubtext, { fontSize: fontSize.sm, color: colors.textTertiary, marginTop: spacing.xs }]}>
        Tap the + button to create your first task
      </Text>
    </View>
  ), [colors, spacing, fontSize]);

  // Memoize render item callback
  const renderItem = useCallback(({ item }: { item: Task }) => (
    <TaskItem task={item} onPress={() => handleTaskPress(item)} />
  ), [handleTaskPress]);

  // Optimize FlatList with getItemLayout for faster scrolling
  const getItemLayout = useCallback((data: Task[] | null | undefined, index: number) => ({
    length: 90, // Approximate height of TaskItem
    offset: 90 * index,
    index,
  }), []);

  // Memoize keyExtractor
  const keyExtractor = useCallback((item: Task) => item.id, []);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredTasks}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        ListHeaderComponent={
          <>
            {renderHeader}
            <View style={{ paddingHorizontal: spacing.md }}>
              {renderStats}
              {renderFilters}
            </View>
          </>
        }
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          filteredTasks.length === 0 && styles.listContentEmpty,
        ]}
        style={{ paddingHorizontal: spacing.md }}
      />

      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            width: 56,
            height: 56,
            borderRadius: borderRadius.round,
            bottom: spacing.xl + 60,
            right: spacing.md,
          },
          shadows.lg,
        ]}
        onPress={() => setShowAddModal(true)}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
      </TouchableOpacity>

      <AddTaskModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
      
      <TaskDetailModal
        visible={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      <CategoryManager visible={showCategoryManager} onClose={() => setShowCategoryManager(false)} />

      {/* Celebration Modal */}
      <CelebrationModal
        visible={celebrationQueue.length > 0}
        event={celebrationQueue[0] || null}
        onClose={dismissCelebration}
      />

      {/* Help Bot */}
      <HelpBotModal
        visible={showHelpBot}
        onClose={() => setShowHelpBot(false)}
        onOpenFeedback={() => {
          setShowHelpBot(false);
          setShowFeedback(true);
        }}
      />

      {/* Feedback Modal */}
      <FeedbackModal visible={showFeedback} onClose={() => setShowFeedback(false)} />

      {/* Floating Help Button */}
      {settings.floatingHelpButtonEnabled && (
        <FloatingHelpButton 
          onPress={() => setShowHelpBot(true)} 
          hide={showFeedback || showHelpBot}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontWeight: '700',
  },
  subtitle: {
    fontWeight: '500',
  },
  manageButton: {
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '700',
  },
  statLabel: {
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {},
  filterText: {
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontWeight: '600',
  },
  emptySubtext: {
    fontWeight: '400',
  },
  fab: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
