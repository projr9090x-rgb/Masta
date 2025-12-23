import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { profileService } from '../../services/profileService';
import { useAlert } from '@/template';

interface ProfileEditorProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  currentUsername: string;
  currentAvatarUrl?: string;
  onUpdate: () => void;
}

export function ProfileEditor({
  visible,
  onClose,
  userId,
  currentUsername,
  currentAvatarUrl,
  onUpdate,
}: ProfileEditorProps) {
  const { colors, spacing, fontSize, borderRadius, shadows } = useTheme();
  const { showAlert } = useAlert();
  const [username, setUsername] = useState(currentUsername);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) {
      showAlert('Error', 'Username cannot be empty');
      return;
    }

    if (username.length < 3) {
      showAlert('Error', 'Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    const { error } = await profileService.updateUsername(userId, username.trim());
    setLoading(false);

    if (error) {
      showAlert('Error', error);
      return;
    }

    onUpdate();
    onClose();
  };

  const handlePickPhoto = async () => {
    setUploading(true);
    const { url, error } = await profileService.pickAndUploadPhoto(userId);
    setUploading(false);

    if (error) {
      showAlert('Error', error);
      return;
    }

    if (url) {
      setAvatarUrl(url);
      onUpdate();
    }
  };

  const handleDeletePhoto = async () => {
    showAlert(
      'Delete Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setUploading(true);
            const { error } = await profileService.deletePhoto(userId);
            setUploading(false);

            if (error) {
              showAlert('Error', error);
              return;
            }

            setAvatarUrl(undefined);
            onUpdate();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              borderBottomWidth: 1,
              borderBottomColor: colors.divider,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
            },
          ]}
        >
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelText, { fontSize: fontSize.base, color: colors.primary }]}>
              Cancel
            </Text>
          </TouchableOpacity>

          <Text style={[styles.title, { fontSize: fontSize.lg, color: colors.text }]}>
            Edit Profile
          </Text>

          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={[styles.saveText, { fontSize: fontSize.base, color: colors.primary }]}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={[styles.content, { padding: spacing.lg }]}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View
              style={[
                styles.avatarContainer,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderRadius: borderRadius.round,
                },
              ]}
            >
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={[styles.avatar, { borderRadius: borderRadius.round }]}
                />
              ) : (
                <MaterialCommunityIcons name="account" size={80} color={colors.textTertiary} />
              )}

              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#FFF" size="large" />
                </View>
              )}
            </View>

            <View style={[styles.photoButtons, { marginTop: spacing.md }]}>
              <TouchableOpacity
                style={[
                  styles.photoButton,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: borderRadius.md,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    marginRight: spacing.sm,
                  },
                  shadows.sm,
                ]}
                onPress={handlePickPhoto}
                disabled={uploading}
              >
                <MaterialCommunityIcons name="camera" size={20} color="#FFF" />
                <Text
                  style={[
                    styles.photoButtonText,
                    { fontSize: fontSize.sm, color: '#FFF', marginLeft: spacing.xs },
                  ]}
                >
                  Change Photo
                </Text>
              </TouchableOpacity>

              {avatarUrl && (
                <TouchableOpacity
                  style={[
                    styles.photoButton,
                    {
                      backgroundColor: colors.backgroundSecondary,
                      borderRadius: borderRadius.md,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                    },
                    shadows.sm,
                  ]}
                  onPress={handleDeletePhoto}
                  disabled={uploading}
                >
                  <MaterialCommunityIcons name="delete" size={20} color={colors.error} />
                  <Text
                    style={[
                      styles.photoButtonText,
                      { fontSize: fontSize.sm, color: colors.error, marginLeft: spacing.xs },
                    ]}
                  >
                    Remove
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Username Section */}
          <View style={[styles.usernameSection, { marginTop: spacing.xl }]}>
            <Text style={[styles.label, { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm }]}>
              USERNAME
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderRadius: borderRadius.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.md,
                  fontSize: fontSize.base,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.divider,
                },
              ]}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text
              style={[
                styles.hint,
                { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing.sm },
              ]}
            >
              Username must be at least 3 characters and unique
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelText: {
    fontWeight: '600',
  },
  title: {
    fontWeight: '700',
  },
  saveText: {
    fontWeight: '600',
  },
  content: {},
  avatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoButtonText: {
    fontWeight: '600',
  },
  usernameSection: {},
  label: {
    fontWeight: '700',
  },
  input: {
    fontWeight: '500',
  },
  hint: {
    fontWeight: '500',
  },
});
