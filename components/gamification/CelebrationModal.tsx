import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { CelebrationEvent } from '../../types/gamification';

interface CelebrationModalProps {
  visible: boolean;
  event: CelebrationEvent | null;
  onClose: () => void;
}

export function CelebrationModal({ visible, event, onClose }: CelebrationModalProps) {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible && event) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();

      // Auto-dismiss after 3 seconds
      const timeout = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timeout);
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible, event]);

  if (!event) return null;

  const getIcon = () => {
    switch (event.type) {
      case 'task_complete':
        return { name: 'checkbox-marked-circle', color: colors.success };
      case 'achievement_unlock':
        return {
          name: event.achievement?.icon || 'trophy',
          color: event.achievement?.color || colors.warning,
        };
      case 'streak_milestone':
        return { name: 'fire', color: colors.error };
      case 'level_up':
        return { name: 'arrow-up-circle', color: colors.primary };
      default:
        return { name: 'star', color: colors.warning };
    }
  };

  const icon = getIcon();

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
            shadows.xl,
          ]}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={icon.name as any} size={48} color={icon.color} />
          </View>

          <Text style={[styles.title, { fontSize: fontSize.xl, color: colors.text, marginTop: spacing.md }]}>
            {event.title}
          </Text>

          <Text
            style={[
              styles.message,
              { fontSize: fontSize.base, color: colors.textSecondary, marginTop: spacing.sm },
            ]}
          >
            {event.message}
          </Text>

          {event.xp && (
            <View
              style={[
                styles.xpBadge,
                {
                  backgroundColor: colors.primary,
                  borderRadius: borderRadius.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  marginTop: spacing.md,
                },
              ]}
            >
              <Text style={[styles.xpText, { fontSize: fontSize.sm, color: '#FFF' }]}>
                +{event.xp} XP
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.closeButton,
              {
                backgroundColor: colors.backgroundSecondary,
                borderRadius: borderRadius.md,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                marginTop: spacing.lg,
              },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.closeText, { fontSize: fontSize.base, color: colors.text }]}>
              Awesome!
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  xpBadge: {
    alignSelf: 'center',
  },
  xpText: {
    fontWeight: '700',
  },
  closeButton: {},
  closeText: {
    fontWeight: '600',
  },
});
