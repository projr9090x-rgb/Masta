import { Stack } from 'expo-router';
import { AlertProvider, AuthProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TaskProvider } from '../contexts/TaskContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { CategoryProvider } from '../contexts/CategoryContext';
import { WeeklyReportProvider } from '../contexts/WeeklyReportContext';
import { GamificationProvider } from '../contexts/GamificationContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <SettingsProvider>
            <CategoryProvider>
              <GamificationProvider>
                <TaskProvider>
                  <WeeklyReportProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="index" options={{ headerShown: false }} />
                      <Stack.Screen name="login" options={{ headerShown: false }} />
                      <Stack.Screen name="(tabs)" />
                    </Stack>
                  </WeeklyReportProvider>
                </TaskProvider>
              </GamificationProvider>
            </CategoryProvider>
          </SettingsProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
