import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useGamification } from '../../hooks/useGamification';
import { ACHIEVEMENT_DEFINITIONS } from '../../services/gamificationService';
import { AchievementType } from '../../types/gamification';

export function BadgesList() {
  const { colors, spacing, fontSize, borderRadius } = useTheme();
  const { achievements } = useGamification();

  const achievementMap = new Map(achievements.map((a) => [a.achievementType, a]));

  const allAchievements = Object.values(ACHIEVEMENT_DEFINITIONS);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontSize: fontSize.lg, color: colors.text, marginBottom: spacing.md }]}>
        Achievements
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {allAchievements.map((definition) => {
          const achievement = achievementMap.get(definition.type);
          const isUnlocked = achievement?.unlockedAt != null;
          const progress = achievement?.progress || 0;

          return (
            <View
              key={definition.type}
              style={[
                styles.badge,
                {
                  backgroundColor: isUnlocked ? colors.card : colors.backgroundSecondary,
                  borderRadius: borderRadius.lg,
                  padding: spacing.md,
                  marginRight: spacing.md,
                  opacity: isUnlocked ? 1 : 0.5,
                },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isUnlocked ? definition.color + '20' : colors.backgroundTertiary,
                    borderRadius: borderRadius.round,
                    width: 56,
                    height: 56,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    isUnlocked
                      ? (definition.icon as any)
                      : 'lock-outline'
                  }
                  size={28}
                  color={isUnlocked ? definition.color : colors.textTertiary}
                />
              </View>

              <Text
                style={[
                  styles.badgeTitle,
                  {
                    fontSize: fontSize.sm,
                    color: isUnlocked ? colors.text : colors.textSecondary,
                    marginTop: spacing.sm,
                  },
                ]}
                numberOfLines={1}
              >
                {definition.title}
              </Text>

              <Text
                style={[
                  styles.badgeDescription,
                  {
                    fontSize: fontSize.xs,
                    color: colors.textTertiary,
                    marginTop: spacing.xs,
                  },
                ]}
                numberOfLines={2}
              >
                {definition.description}
              </Text>

              {!isUnlocked && (
                <View style={[styles.progressContainer, { marginTop: spacing.sm }]}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        backgroundColor: colors.backgroundTertiary,
                        borderRadius: borderRadius.sm,
                        height: 4,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min((progress / definition.requirement) * 100, 100)}%`,
                          backgroundColor: definition.color,
                          borderRadius: borderRadius.sm,
                          height: 4,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.progressText,
                      {
                        fontSize: fontSize.xs,
                        color: colors.textTertiary,
                        marginTop: spacing.xs,
                      },
                    ]}
                  >
                    {progress}/{definition.requirement}
                  </Text>
                </View>
              )}

              {isUnlocked && (
                <View
                  style={[
                    styles.xpBadge,
                    {
                      backgroundColor: colors.primary + '20',
                      borderRadius: borderRadius.sm,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                      marginTop: spacing.sm,
                    },
                  ]}
                >
                  <Text style={[styles.xpText, { fontSize: fontSize.xs, color: colors.primary }]}>
                    +{definition.xpReward} XP
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {
    fontWeight: '700',
  },
  scrollContent: {
    paddingRight: 16,
  },
  badge: {
    width: 140,
    minHeight: 180,
  },
  iconContainer: {},
  badgeTitle: {
    fontWeight: '700',
  },
  badgeDescription: {
    fontWeight: '500',
    lineHeight: 16,
  },
  progressContainer: {},
  progressBar: {
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {},
  progressText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  xpBadge: {
    alignSelf: 'flex-start',
  },
  xpText: {
    fontWeight: '700',
  },
});
