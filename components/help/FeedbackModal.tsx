import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { FeedbackCategory } from '../../types/feedback';
import { feedbackService } from '../../services/feedbackService';
import { useAlert } from '@/template';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const { showAlert } = useAlert();
  const [category, setCategory] = useState<FeedbackCategory>('general_feedback');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories: { value: FeedbackCategory; label: string; icon: string; color: string }[] = [
    {
      value: 'bug_report',
      label: 'Bug Report',
      icon: 'bug',
      color: colors.error,
    },
    {
      value: 'feature_request',
      label: 'Feature Request',
      icon: 'lightbulb-outline',
      color: colors.warning,
    },
    {
      value: 'general_feedback',
      label: 'General Feedback',
      icon: 'message-text-outline',
      color: colors.info,
    },
  ];

  const handleSubmit = async () => {
    if (!message.trim()) {
      showAlert('Required', 'Please enter your feedback message.');
      return;
    }

    if (message.trim().length < 10) {
      showAlert('Too Short', 'Please provide more details (at least 10 characters).');
      return;
    }

    setSubmitting(true);
    try {
      await feedbackService.submitFeedback({
        category,
        message: message.trim(),
      });

      // Only clear form on success
      const successMessage = message;
      const successCategory = category;
      setMessage('');
      setCategory('general_feedback');

      showAlert(
        'Feedback Sent Successfully ✅',
        'We appreciate you taking the time to help us improve TaskMaster. Your feedback has been received and will be reviewed by our team.',
        [
          {
            text: 'OK',
            onPress: () => onClose(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      
      // Keep message intact on error
      let errorMessage = 'Failed to submit feedback. Please check your internet connection and try again.';
      
      if (error?.message) {
        if (error.message.includes('Not authenticated')) {
          errorMessage = 'Please log in to submit feedback.';
        } else if (error.message.includes('network') || error.message.includes('offline')) {
          errorMessage = 'No internet connection. Your feedback will be saved and sent when you are online.';
        }
      }

      showAlert('Submission Failed', errorMessage, [
        { text: 'OK', style: 'cancel' },
        {
          text: 'Retry',
          onPress: () => handleSubmit(),
        },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (message.trim()) {
      showAlert('Discard Feedback?', 'Your feedback has not been submitted. Are you sure you want to close?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            setMessage('');
            setCategory('general_feedback');
            onClose();
          },
        },
      ]);
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: colors.divider },
            shadows.sm,
          ]}
        >
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { fontSize: fontSize.lg, color: colors.text }]}>
            Send Feedback
          </Text>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || !message.trim()}
            style={styles.submitButton}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text
                style={[
                  styles.submitText,
                  {
                    fontSize: fontSize.base,
                    color: message.trim() ? colors.primary : colors.textTertiary,
                  },
                ]}
              >
                Send
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>
          {/* Category Selection */}
          <Text
            style={[
              styles.sectionTitle,
              { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
            ]}
          >
            CATEGORY
          </Text>

          <View style={styles.categoriesContainer}>
            {categories.map((cat) => {
              const isSelected = category === cat.value;
              return (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: isSelected ? cat.color : colors.card,
                      borderRadius: borderRadius.md,
                      padding: spacing.md,
                      marginBottom: spacing.sm,
                    },
                    shadows.sm,
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={24}
                    color={isSelected ? '#FFF' : cat.color}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      {
                        fontSize: fontSize.base,
                        color: isSelected ? '#FFF' : colors.text,
                        marginLeft: spacing.sm,
                      },
                    ]}
                  >
                    {cat.label}
                  </Text>
                  {isSelected && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color="#FFF"
                      style={{ marginLeft: 'auto' }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Message Input */}
          <Text
            style={[
              styles.sectionTitle,
              {
                fontSize: fontSize.sm,
                color: colors.textSecondary,
                marginTop: spacing.lg,
                marginBottom: spacing.sm,
              },
            ]}
          >
            YOUR MESSAGE
          </Text>

          <TextInput
            style={[
              styles.messageInput,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                fontSize: fontSize.base,
                color: colors.text,
                minHeight: 150,
              },
              shadows.sm,
            ]}
            placeholder="Tell us what you think..."
            placeholderTextColor={colors.textTertiary}
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
          />

          {/* Info */}
          <View
            style={[
              styles.infoContainer,
              {
                backgroundColor: colors.backgroundSecondary,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                marginTop: spacing.md,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color={colors.info}
              style={{ marginRight: spacing.sm }}
            />
            <Text
              style={[
                styles.infoText,
                { fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
              ]}
            >
              Your feedback will include your device info and app version to help us better
              understand and address your concerns.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontWeight: '700',
  },
  submitButton: {
    padding: 4,
  },
  submitText: {
    fontWeight: '700',
  },
  sectionTitle: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoriesContainer: {},
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryLabel: {
    fontWeight: '600',
  },
  messageInput: {},
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    lineHeight: 20,
  },
});
