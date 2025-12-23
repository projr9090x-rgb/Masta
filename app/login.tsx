import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, useAlert } from '@/template';
import { useTheme } from '../hooks/useTheme';

type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const { sendOTP, verifyOTPAndLogin, signInWithPassword, operationLoading } = useAuth();
  const { showAlert } = useAlert();
  const { colors, spacing, fontSize, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setShowOtpInput(false);
    setShowPassword(false);
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      showAlert('Error', 'Please enter your email address');
      return;
    }

    if (!password.trim() || password.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Error', 'Passwords do not match');
      return;
    }

    const { error } = await sendOTP(email.trim());
    if (error) {
      showAlert('Error', error);
      return;
    }

    setShowOtpInput(true);
    showAlert('Success', 'Verification code sent to your email');
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 4) {
      showAlert('Error', 'Please enter the 4-digit verification code');
      return;
    }

    const { error } = await verifyOTPAndLogin(email.trim(), otp.trim(), { password });
    if (error) {
      showAlert('Error', error);
      return;
    }
    // AuthRouter will handle navigation automatically
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      showAlert('Error', 'Please enter your email address');
      return;
    }

    if (!password.trim()) {
      showAlert('Error', 'Please enter your password');
      return;
    }

    const { error } = await signInWithPassword(email.trim(), password.trim());
    if (error) {
      showAlert('Error', error);
      return;
    }
    // AuthRouter will handle navigation automatically
  };

  const toggleMode = () => {
    resetForm();
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { marginBottom: spacing.xl }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary, borderRadius: borderRadius.round }]}>
            <MaterialCommunityIcons name="checkbox-marked-circle" size={48} color="#FFF" />
          </View>
          <Text style={[styles.title, { fontSize: fontSize.hero, color: colors.text, marginTop: spacing.md }]}>
            TaskMaster
          </Text>
          <Text style={[styles.subtitle, { fontSize: fontSize.base, color: colors.textSecondary, marginTop: spacing.xs }]}>
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </Text>
        </View>

        <View style={[styles.form, { paddingHorizontal: spacing.md }]}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                fontSize: fontSize.base,
                color: colors.text,
                marginBottom: spacing.md,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!showOtpInput && !operationLoading}
          />

          <View style={{ marginBottom: spacing.md }}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    backgroundColor: colors.card,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                    fontSize: fontSize.base,
                    color: colors.text,
                    flex: 1,
                  },
                ]}
                placeholder="Password"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!showOtpInput && !operationLoading}
              />
              <TouchableOpacity
                style={[styles.eyeIcon, { padding: spacing.md }]}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {mode === 'register' && !showOtpInput && (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  fontSize: fontSize.base,
                  color: colors.text,
                  marginBottom: spacing.md,
                },
              ]}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              editable={!operationLoading}
            />
          )}

          {showOtpInput && (
            <View style={{ marginBottom: spacing.md }}>
              <Text style={[styles.otpLabel, { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm }]}>
                Enter the 4-digit code sent to your email
              </Text>
              <TextInput
                style={[
                  styles.otpInput,
                  {
                    backgroundColor: colors.card,
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                    fontSize: fontSize.xl,
                    color: colors.text,
                    textAlign: 'center',
                    letterSpacing: 8,
                  },
                ]}
                placeholder="0000"
                placeholderTextColor={colors.textTertiary}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={4}
                editable={!operationLoading}
              />
            </View>
          )}

          {mode === 'register' && !showOtpInput && (
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: colors.primary,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  marginTop: spacing.md,
                },
                operationLoading && { opacity: 0.6 },
              ]}
              onPress={handleSendOTP}
              disabled={operationLoading}
            >
              {operationLoading ? (
                <Text style={[styles.buttonText, { fontSize: fontSize.base, color: '#FFF' }]}>
                  Sending...
                </Text>
              ) : (
                <Text style={[styles.buttonText, { fontSize: fontSize.base, color: '#FFF' }]}>
                  Send Verification Code
                </Text>
              )}
            </TouchableOpacity>
          )}

          {showOtpInput && (
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: colors.primary,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  marginTop: spacing.md,
                },
                operationLoading && { opacity: 0.6 },
              ]}
              onPress={handleVerifyOTP}
              disabled={operationLoading}
            >
              {operationLoading ? (
                <Text style={[styles.buttonText, { fontSize: fontSize.base, color: '#FFF' }]}>
                  Verifying...
                </Text>
              ) : (
                <Text style={[styles.buttonText, { fontSize: fontSize.base, color: '#FFF' }]}>
                  Create Account
                </Text>
              )}
            </TouchableOpacity>
          )}

          {mode === 'login' && (
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: colors.primary,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  marginTop: spacing.md,
                },
                operationLoading && { opacity: 0.6 },
              ]}
              onPress={handleLogin}
              disabled={operationLoading}
            >
              {operationLoading ? (
                <Text style={[styles.buttonText, { fontSize: fontSize.base, color: '#FFF' }]}>
                  Signing in...
                </Text>
              ) : (
                <Text style={[styles.buttonText, { fontSize: fontSize.base, color: '#FFF' }]}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          )}

          <View style={[styles.footer, { marginTop: spacing.lg }]}>
            <Text style={[styles.footerText, { fontSize: fontSize.sm, color: colors.textSecondary }]}>
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <TouchableOpacity onPress={toggleMode} disabled={operationLoading}>
              <Text style={[styles.footerLink, { fontSize: fontSize.sm, color: colors.primary, marginLeft: spacing.xs }]}>
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    fontWeight: '500',
  },
  form: {},
  input: {
    fontWeight: '400',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    fontWeight: '400',
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
  },
  otpLabel: {
    fontWeight: '500',
    textAlign: 'center',
  },
  otpInput: {
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontWeight: '400',
  },
  footerLink: {
    fontWeight: '600',
  },
});
