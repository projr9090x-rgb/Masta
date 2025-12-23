import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings } from './useSettings';
import { useTasks } from './useTasks';
import { calendarService } from '../services/calendarService';

const CALENDAR_ID_KEY = '@taskmaster_calendar_id';
const SYNCED_TASKS_KEY = '@taskmaster_synced_tasks';

export function useCalendarSync() {
  const { settings } = useSettings();
  const { tasks } = useTasks();

  useEffect(() => {
    const syncTasksToCalendar = async () => {
      if (!settings.calendarSyncEnabled) {
        return;
      }

      try {
        const calendarId = await AsyncStorage.getItem(CALENDAR_ID_KEY);
        if (!calendarId) {
          return;
        }

        // Get previously synced tasks
        const syncedTasksJson = await AsyncStorage.getItem(SYNCED_TASKS_KEY);
        const syncedTasks: Record<string, string> = syncedTasksJson
          ? JSON.parse(syncedTasksJson)
          : {};

        // Sync each task with due date
        for (const task of tasks) {
          if (task.dueDate && !task.completed) {
            // Check if task already synced
            if (!syncedTasks[task.id]) {
              // Create new calendar event
              const eventId = await calendarService.syncTaskToCalendar(task, calendarId);
              if (eventId) {
                syncedTasks[task.id] = eventId;
              }
            } else {
              // Update existing calendar event
              await calendarService.updateCalendarEvent(
                syncedTasks[task.id],
                task,
                calendarId
              );
            }
          } else if (syncedTasks[task.id]) {
            // Remove from calendar if completed or no due date
            await calendarService.removeTaskFromCalendar(syncedTasks[task.id]);
            delete syncedTasks[task.id];
          }
        }

        // Save updated sync state
        await AsyncStorage.setItem(SYNCED_TASKS_KEY, JSON.stringify(syncedTasks));
      } catch (error) {
        console.error('Error syncing tasks to calendar:', error);
      }
    };

    syncTasksToCalendar();
  }, [tasks, settings.calendarSyncEnabled]);
}
