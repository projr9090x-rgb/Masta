import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useTasks } from '../../hooks/useTasks';
import { useSettings } from '../../hooks/useSettings';
import { useGamification } from '../../hooks/useGamification';
import { gamificationService } from '../../services/gamificationService';
import { personalRecordsService } from '../../services/personalRecordsService';
import { useAlert, useAuth } from '@/template';
import { PersonalRecord } from '../../types/personalRecords';
import { BadgesList } from '../../components/gamification/BadgesList';
import { CelebrationModal } from '../../components/gamification/CelebrationModal';
import { ThemePicker } from '../../components/ui/ThemePicker';
import { ProfileEditor } from '../../components/profile/ProfileEditor';
import { PersonalRecordsCard } from '../../components/profile/PersonalRecordsCard';
import { HelpBotModal } from '../../components/help/HelpBotModal';
import { FeedbackModal } from '../../components/help/FeedbackModal';
import { FloatingHelpButton } from '../../components/help/FloatingHelpButton';

export default function ProfileScreen() {
  const { colors, spacing, fontSize, borderRadius, shadows, themeName } = useTheme();
  const { stats } = useTasks();
  const { settings, toggleNotifications, toggleCalendarSync, toggleCloudBackup, toggleStreakWarning, toggleFloatingHelpButton, setTheme, setReminderTime, setStreakWarningTime } = useSettings();
  const { celebrationQueue, dismissCelebration } = useGamification();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const [totalXP, setTotalXP] = React.useState(0);
  const [level, setLevel] = React.useState(1);
  const [showThemePicker, setShowThemePicker] = React.useState(false);
  const [showProfileEditor, setShowProfileEditor] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>();
  const [personalRecords, setPersonalRecords] = React.useState<PersonalRecord | null>(null);
  const [syncStatus, setSyncStatus] = React.useState<'synced' | 'syncing' | 'offline'>('synced');
  const [showHelpBot, setShowHelpBot] = React.useState(false);
  const [showFeedback, setShowFeedback] = React.useState(false);

  // Load user data
  React.useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const { getSupabaseClient } = await import('@/template');
        const supabase = getSupabaseClient();
        
        // Load user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUsername(profile.username || user.email?.split('@')[0] || 'Task Master');
          setAvatarUrl(profile.avatar_url);
        }

        // Load XP and level
        const { data: settingsData } = await supabase
          .from('user_settings')
          .select('total_xp, level')
          .single();
        
        if (settingsData) {
          setTotalXP(settingsData.total_xp || 0);
          setLevel(settingsData.level || 1);
        }

        // Load personal records
        const records = await personalRecordsService.getPersonalRecords(user.id);
        setPersonalRecords(records);

        setSyncStatus('synced');
      } catch (error) {
        console.error('Error loading user data:', error);
        setSyncStatus('offline');
      }
    };
    
    loadUserData();
  }, [user, celebrationQueue]);

  const handleProfileUpdate = async () => {
    // Reload user data after profile update
    if (!user) return;
    
    const { getSupabaseClient } = await import('@/template');
    const supabase = getSupabaseClient();
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      setUsername(profile.username || user.email?.split('@')[0] || 'Task Master');
      setAvatarUrl(profile.avatar_url);
    }
  };

  const handleNotificationToggle = async () => {
    const success = await toggleNotifications();
    if (!success) {
      showAlert(
        'Permission Required',
        'Please enable notifications in your device settings to use this feature.'
      );
    }
  };

  const handleStreakWarningToggle = async () => {
    await toggleStreakWarning();
  };

  const handleStreakWarningTimeChange = () => {
    showAlert(
      'Streak Warning Time',
      'Choose when to receive streak warnings',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '5:00 PM', onPress: () => setStreakWarningTime(17) },
        { text: '6:00 PM', onPress: () => setStreakWarningTime(18) },
        { text: '7:00 PM', onPress: () => setStreakWarningTime(19) },
        { text: '8:00 PM', onPress: () => setStreakWarningTime(20) },
        { text: '9:00 PM', onPress: () => setStreakWarningTime(21) },
      ]
    );
  };

  const handleCalendarSyncToggle = async () => {
    const success = await toggleCalendarSync();
    if (!success) {
      showAlert(
        'Permission Required',
        'Please enable calendar access in your device settings to use this feature.'
      );
    } else {
      showAlert(
        'Calendar Sync',
        settings.calendarSyncEnabled
          ? 'Calendar sync has been disabled'
          : 'Calendar sync enabled! Your tasks will now sync with your device calendar.'
      );
    }
  };

  const handleCloudBackupToggle = async () => {
    await toggleCloudBackup();
    showAlert(
      'Cloud Backup',
      settings.cloudBackupEnabled
        ? 'Cloud backup disabled. Your data is stored locally only.'
        : 'Cloud backup enabled! Your tasks will be backed up automatically.'
    );
  };

  const handleReminderTimeChange = () => {
    showAlert(
      'Reminder Time',
      'Choose when to be reminded before task due date',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '15 minutes', onPress: () => setReminderTime(15) },
        { text: '30 minutes', onPress: () => setReminderTime(30) },
        { text: '1 hour', onPress: () => setReminderTime(60) },
        { text: '1 day', onPress: () => setReminderTime(1440) },
      ]
    );
  };

  const handleThemeChange = () => {
    showAlert(
      'Choose Theme',
      'Select your preferred theme',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Light', onPress: () => setTheme('light') },
        { text: 'Dark', onPress: () => setTheme('dark') },
        { text: 'System', onPress: () => setTheme('system') },
      ]
    );
  };

  const getReminderTimeText = () => {
    const minutes = settings.reminderTime;
    if (minutes < 60) return `${minutes} minutes before`;
    if (minutes < 1440) return `${minutes / 60} hour${minutes > 60 ? 's' : ''} before`;
    return `${minutes / 1440} day${minutes > 1440 ? 's' : ''} before`;
  };

  const getStreakWarningTimeText = () => {
    const hour = settings.streakWarningTime;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getThemeText = () => {
    return themeName || 'Default';
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return { name: 'cloud-check', color: colors.success };
      case 'syncing':
        return { name: 'cloud-sync', color: colors.primary };
      case 'offline':
        return { name: 'cloud-off-outline', color: colors.textTertiary };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.md }]}>
        <Text style={[styles.title, { fontSize: fontSize.hero, color: colors.text }]}>
          Profile
        </Text>
        
        {/* Sync Status Indicator */}
        <View style={styles.syncIndicator}>
          <MaterialCommunityIcons 
            name={getSyncStatusIcon().name as any} 
            size={20} 
            color={getSyncStatusIcon().color} 
          />
          <Text style={[styles.syncText, { fontSize: fontSize.xs, color: colors.textTertiary, marginLeft: spacing.xs }]}>
            {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Offline'}
          </Text>
        </View>
      </View>

      <ScrollView style={{ padding: spacing.md }}>
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md }, shadows.md]}
          onPress={() => setShowProfileEditor(true)}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={[styles.avatarImage, { width: 80, height: 80, borderRadius: borderRadius.round }]}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.primary, width: 80, height: 80, borderRadius: borderRadius.round }]}>
              <MaterialCommunityIcons name="account" size={48} color="#FFF" />
            </View>
          )}
          
          <View style={[styles.profileInfo, { marginTop: spacing.md }]}>
            <Text style={[styles.name, { fontSize: fontSize.xxl, color: colors.text }]}>
              {username}
            </Text>
            <Text style={[styles.email, { fontSize: fontSize.base, color: colors.textSecondary, marginTop: spacing.xs }]}>
              {user?.email || 'user@example.com'}
            </Text>
            <TouchableOpacity style={[styles.editButton, { marginTop: spacing.sm }]}>
              <MaterialCommunityIcons name="pencil" size={16} color={colors.primary} />
              <Text style={[styles.editText, { fontSize: fontSize.sm, color: colors.primary, marginLeft: spacing.xs }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* XP Progress Bar */}
          <View style={[styles.xpContainer, { marginTop: spacing.lg }]}>
            <View style={styles.xpHeader}>
              <Text style={[styles.xpLabel, { fontSize: fontSize.sm, color: colors.textSecondary }]}>
                Level {level}
              </Text>
              <Text style={[styles.xpValue, { fontSize: fontSize.sm, color: colors.textSecondary }]}>
                {totalXP} / {gamificationService.getXPForNextLevel(totalXP)} XP
              </Text>
            </View>
            <View
              style={[
                styles.xpBar,
                {
                  backgroundColor: colors.backgroundTertiary,
                  borderRadius: borderRadius.sm,
                  height: 8,
                  marginTop: spacing.xs,
                },
              ]}
            >
              <View
                style={[
                  styles.xpFill,
                  {
                    width: `${Math.min(
                      ((totalXP % 1000) / 1000) * 100,
                      100
                    )}%`,
                    backgroundColor: colors.primary,
                    borderRadius: borderRadius.sm,
                    height: 8,
                  },
                ]}
              />
            </View>
          </View>

          <View style={[styles.achievementContainer, { marginTop: spacing.lg }]}>
            <View style={styles.achievement}>
              <Text style={[styles.achievementValue, { fontSize: fontSize.xl, color: colors.text }]}>
                {stats.streak}
              </Text>
              <Text style={[styles.achievementLabel, { fontSize: fontSize.xs, color: colors.textSecondary }]}>
                Day Streak
              </Text>
            </View>
            <View style={styles.achievement}>
              <Text style={[styles.achievementValue, { fontSize: fontSize.xl, color: colors.text }]}>
                {stats.completed}
              </Text>
              <Text style={[styles.achievementLabel, { fontSize: fontSize.xs, color: colors.textSecondary }]}>
                Completed
              </Text>
            </View>
            <View style={styles.achievement}>
              <Text style={[styles.achievementValue, { fontSize: fontSize.xl, color: colors.text }]}>
                {Math.round(stats.completionRate)}%
              </Text>
              <Text style={[styles.achievementLabel, { fontSize: fontSize.xs, color: colors.textSecondary }]}>
                Success Rate
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Personal Records Section */}
        <PersonalRecordsCard records={personalRecords} />

        {/* Badges Section */}
        <View style={[styles.badgesSection, { marginTop: spacing.md }]}>
          <BadgesList />
        </View>

        <View style={[styles.settingsSection, { marginTop: spacing.md }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing.sm }]}>
            NOTIFICATIONS
          </Text>

          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                marginBottom: spacing.sm,
              },
              shadows.sm,
            ]}
          >
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.primary} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={[styles.settingTitle, { fontSize: fontSize.base, color: colors.text }]}>
                Task Reminders
              </Text>
              <Text style={[styles.settingSubtitle, { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }]}>
                Get notified about upcoming tasks
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.backgroundTertiary, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          {settings.notificationsEnabled && (
            <>
              <TouchableOpacity
                style={[
                  styles.settingItem,
                  {
                    backgroundColor: colors.card,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                    marginBottom: spacing.sm,
                  },
                  shadows.sm,
                ]}
                onPress={handleReminderTimeChange}
              >
                <MaterialCommunityIcons name="clock-outline" size={24} color={colors.primary} />
                <View style={{ marginLeft: spacing.md, flex: 1 }}>
                  <Text style={[styles.settingTitle, { fontSize: fontSize.base, color: colors.text }]}>
                    Reminder Time
                  </Text>
                  <Text style={[styles.settingSubtitle, { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }]}>
                    {getReminderTimeText()}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
              </TouchableOpacity>

              <View
                style={[
                  styles.settingItem,
                  {
                    backgroundColor: colors.card,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                    marginBottom: spacing.sm,
                  },
                  shadows.sm,
                ]}
              >
                <MaterialCommunityIcons name="fire-alert" size={24} color={colors.error} />
                <View style={{ marginLeft: spacing.md, flex: 1 }}>
                  <Text style={[styles.settingTitle, { fontSize: fontSize.base, color: colors.text }]}>
                    Streak Warnings
                  </Text>
                  <Text style={[styles.settingSubtitle, { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }]}>
                    Daily reminder to keep your streak
                  </Text>
                </View>
                <Switch
                  value={settings.streakWarningEnabled}
                  onValueChange={handleStreakWarningToggle}
                  trackColor={{ false: colors.backgroundTertiary, true: colors.error }}
                  thumbColor="#FFF"
                />
              </View>

              {settings.streakWarningEnabled && (
                <TouchableOpacity
                  style={[
                    styles.settingItem,
                    {
                      backgroundColor: colors.card,
                      borderRadius: borderRadius.md,
                      padding: spacing.md,
                      marginBottom: spacing.sm,
                    },
                    shadows.sm,
                  ]}
                  onPress={handleStreakWarningTimeChange}
                >
                  <MaterialCommunityIcons name="clock-alert-outline" size={24} color={colors.error} />
                  <View style={{ marginLeft: spacing.md, flex: 1 }}>
                    <Text style={[styles.settingTitle, { fontSize: fontSize.base, color: colors.text }]}>
                      Warning Time
                    </Text>
                    <Text style={[styles.settingSubtitle, { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }]}>
                      {getStreakWarningTimeText()}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={[styles.settingsSection, { marginTop: spacing.lg }]}>          <Text style={[styles.sectionTitle, { fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing.sm }]}>            HELP & SUPPORT
          </Text>

          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                marginBottom: spacing.sm,
              },
              shadows.sm,
            ]}
          >
            <MaterialCommunityIcons name="chat-question" size={24} color={colors.primary} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={[styles.settingTitle, { fontSize: fontSize.base, color: colors.text }]}>
                Floating Help Assistant
              </Text>
              <Text style={[styles.settingSubtitle, { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }]}>
                Draggable help button on all screens
              </Text>
            </View>
            <Switch
              value={settings.floatingHelpButtonEnabled}
              onValueChange={toggleFloatingHelpButton}
              trackColor={{ false: colors.backgroundTertiary, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                marginBottom: spacing.sm,
              },
              shadows.sm,
            ]}
            onPress={() => setShowFeedback(true)}
          >
            <MaterialCommunityIcons name="message-text-outline" size={24} color={colors.info} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={[styles.settingTitle, { fontSize: fontSize.base, color: colors.text }]}>
                Send Feedback
              </Text>
              <Text style={[styles.settingSubtitle, { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }]}>
                Report bugs or suggest new features
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.settingsSection, { marginTop: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing.sm }]}>
            SYNC & BACKUP
          </Text>

          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                marginBottom: spacing.sm,
              },
              shadows.sm,
            ]}
          >
            <MaterialCommunityIcons name="calendar-sync" size={24} color={colors.primary} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={[styles.settingTitle, { fontSize: fontSize.base, color: colors.text }]}>
                Calendar Sync
              </Text>
              <Text style={[styles.settingSubtitle, { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }]}>
                Sync tasks with device calendar
              </Text>
            </View>
            <Switch
              value={settings.calendarSyncEnabled}
              onValueChange={handleCalendarSyncToggle}
              trackColor={{ false: colors.backgroundTertiary, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                marginBottom: spacing.sm,
              },
              shadows.sm,
            ]}
          >
            <MaterialCommunityIcons name="cloud-upload-outline" size={24} color={colors.success} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={[styles.settingTitle, { fontSize: fontSize.base, color: colors.text }]}>
                Cloud Sync
              </Text>
              <Text style={[styles.settingSubtitle, { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }]}>
                All data syncs automatically across devices
              </Text>
            </View>
            <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />
          </View>
        </View>

        <View style={[styles.settingsSection, { marginTop: spacing.lg }]}>          <Text style={[styles.sectionTitle, { fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing.sm }]}>            HELP & SUPPORT
          </Text>

          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                marginBottom: spacing.sm,
              },
              shadows.sm,
            ]}
          >
            <MaterialCommunityIcons name="chat-question" size={24} color={colors.primary} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={[styles.settingTitle, { fontSize: fontSize.base, color: colors.text }]}>
                Floating Help Assistant
              </Text>
              <Text style={[styles.settingSubtitle, { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }]}>
                Draggable help button on all screens
              </Text>
            </View>
            <Switch
              value={settings.floatingHelpButtonEnabled}
              onValueChange={toggleFloatingHelpButton}
              trackColor={{ false: colors.backgroundTertiary, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                marginBottom: spacing.sm,
              },
              shadows.sm,
            ]}
            onPress={() => setShowFeedback(true)}
          >
            <MaterialCommunityIcons name="message-text-outline" size={24} color={colors.info} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={[styles.settingTitle, { fontSize: fontSize.base, color: colors.text }]}>
                Send Feedback
              </Text>
              <Text style={[styles.settingSubtitle, { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }]}>
                Report bugs or suggest new features
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.settingsSection, { marginTop: spacing.lg }]}>
          <Text style={[styles.sectionTitle, { fontSize: fontSize.base, color: colors.textSecondary, marginBottom: spacing.sm }]}>
            APPEARANCE
          </Text>

          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                marginBottom: spacing.sm,
              },
              shadows.sm,
            ]}
            onPress={() => setShowThemePicker(true)}
          >
            <MaterialCommunityIcons name="palette-outline" size={24} color={colors.primary} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={[styles.settingTitle, { fontSize: fontSize.base, color: colors.text }]}>
                Theme
              </Text>
              <Text style={[styles.settingSubtitle, { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }]}>
                {getThemeText()}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                marginBottom: spacing.sm,
              },
              shadows.sm,
            ]}
            onPress={handleThemeChange}
          >
            <MaterialCommunityIcons name="theme-light-dark" size={24} color={colors.primary} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={[styles.settingTitle, { fontSize: fontSize.base, color: colors.text }]}>
                Appearance Mode
              </Text>
              <Text style={[styles.settingSubtitle, { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 }]}>
                {settings.themeMode.charAt(0).toUpperCase() + settings.themeMode.slice(1)}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.dangerZone, { marginTop: spacing.xl, marginBottom: spacing.xxl }]}>
          <TouchableOpacity
            style={[
              styles.dangerButton,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.error,
              },
            ]}
            onPress={() => {
              showAlert(
                'Sign Out',
                'Are you sure you want to sign out? All your data is safely synced to the cloud.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                      const { error } = await logout();
                      if (error) {
                        showAlert('Error', error);
                      }
                    },
                  },
                ]
              );
            }}
          >
            <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
            <Text style={[styles.dangerText, { fontSize: fontSize.base, color: colors.error, marginLeft: spacing.sm }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Celebration Modal */}
      <CelebrationModal
        visible={celebrationQueue.length > 0}
        event={celebrationQueue[0] || null}
        onClose={dismissCelebration}
      />

      {/* Theme Picker Modal */}
      <ThemePicker visible={showThemePicker} onClose={() => setShowThemePicker(false)} />

      {/* Profile Editor Modal */}
      {user && (
        <ProfileEditor
          visible={showProfileEditor}
          onClose={() => setShowProfileEditor(false)}
          userId={user.id}
          currentUsername={username}
          currentAvatarUrl={avatarUrl}
          onUpdate={handleProfileUpdate}
        />
      )}

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
  header: {
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncText: {
    fontWeight: '600',
  },
  profileCard: {
    alignItems: 'center',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {},
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontWeight: '700',
  },
  email: {
    fontWeight: '400',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    fontWeight: '600',
  },
  xpContainer: {
    width: '100%',
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpLabel: {
    fontWeight: '700',
  },
  xpValue: {
    fontWeight: '600',
  },
  xpBar: {
    overflow: 'hidden',
  },
  xpFill: {},
  achievementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  achievement: {
    alignItems: 'center',
  },
  achievementValue: {
    fontWeight: '700',
  },
  achievementLabel: {
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  badgesSection: {},
  settingsSection: {},
  sectionTitle: {
    fontWeight: '700',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontWeight: '600',
  },
  settingSubtitle: {
    fontWeight: '400',
  },
  dangerZone: {},
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerText: {
    fontWeight: '600',
  },
});
