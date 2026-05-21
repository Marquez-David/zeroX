import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';

import Logo from '@assets/icons/Logo';
import GoogleIcon from '@assets/icons/Google';
import GitHubIcon from '@assets/icons/GitHub';
import LoginForm from '@components/CustomForms/LoginForm';
import RegisterForm from '@components/CustomForms/RegisterForm';
import VerifyEmailForm from '@components/CustomForms/VerifyEmailForm';
import SocialButton from '@components/CustomButtons/SocialButton';
import {
  useLoginMutation,
  useRegisterMutation,
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from '@hooks/queries/auth';
import { useModal } from '@contexts/modal';
import { loginStrings, registerStrings, verifyStrings } from '@lib/strings';
import { colors, radii, shadows, spacing, typography } from '@lib/theme';

type Mode = 'login' | 'register' | 'verify';

const LoginScreen = () => {
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationMutation();

  const { toast } = useModal();

  const [mode, setMode] = useState<Mode>('login');
  const [pendingEmail, setPendingEmail] = useState<string>('');

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await loginMutation.mutateAsync(values);
    } catch (err) {
      toast({ message: loginStrings.loginError, type: 'error' });
      throw err;
    }
  };

  const handleRegister = async (values: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      await registerMutation.mutateAsync(values);
      setPendingEmail(values.email);
      setMode('verify');
    } catch (err) {
      toast({
        message: err instanceof Error && err.message ? err.message : registerStrings.registerError,
        type: 'error',
      });
    }
  };

  const handleVerify = async (values: { code: string }) => {
    try {
      await verifyMutation.mutateAsync({
        email: pendingEmail,
        code: values.code,
      });
      toast({ message: verifyStrings.successBanner, type: 'success' });
      setMode('login');
    } catch {
      toast({ message: verifyStrings.verifyError, type: 'error' });
    }
  };

  const handleResend = async () => {
    await resendMutation.mutateAsync(pendingEmail);
  };

  const goTo = (next: Mode) => {
    setMode(next);
  };

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (mode === 'verify') {
        goTo('register');
        return true;
      }
      if (mode === 'register') {
        goTo('login');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [mode]);

  const copy =
    mode === 'login'
      ? loginStrings
      : mode === 'register'
        ? registerStrings
        : null;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FBFAFF', '#FFFFFF', '#F6F4FE']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents='none'
      />
      <View style={[styles.blob, styles.blobTop]} pointerEvents='none' />
      <View style={[styles.blob, styles.blobBottom]} pointerEvents='none' />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.topSection}>
              <View style={styles.brandRow}>
                {mode === 'verify' && (
                  <TouchableOpacity
                    onPress={() => goTo('register')}
                    hitSlop={12}
                    style={styles.backButton}
                  >
                    <ArrowLeft
                      size={20}
                      color={colors.text.primary}
                      strokeWidth={2.5}
                    />
                  </TouchableOpacity>
                )}
                <View style={styles.brandBadge}>
                  <Logo width={160} height={34} />
                </View>
              </View>

              {mode === 'verify' && (
                <View style={styles.verifyHeader}>
                  <Text style={styles.verifyTitle}>{verifyStrings.title}</Text>
                  <Text style={styles.verifySubtitle}>
                    {verifyStrings.subtitle}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.middleSection}>
              {mode === 'login' && (
                <LoginForm onSubmit={handleLogin} />
              )}
              {mode === 'register' && (
                <RegisterForm onSubmit={handleRegister} />
              )}
              {mode === 'verify' && (
                <VerifyEmailForm
                  email={pendingEmail}
                  onSubmit={handleVerify}
                  onResend={handleResend}
                  onChangeEmail={() => goTo('register')}
                />
              )}

              {copy && mode !== 'verify' && (
                <View style={styles.switchRow}>
                  <Text style={styles.switchPrompt}>{copy.switchPrompt}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      goTo(mode === 'login' ? 'register' : 'login')
                    }
                    hitSlop={8}
                  >
                    <Text style={styles.switchCta}>{copy.switchCta}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {mode === 'login' && (
                <View style={styles.socialSection}>
                  <View style={styles.separator}>
                    <View style={styles.separatorLine} />
                    <Text style={styles.separatorText}>
                      {loginStrings.orSeparator}
                    </Text>
                    <View style={styles.separatorLine} />
                  </View>

                  <SocialButton
                    label={loginStrings.googleSignIn}
                    icon={<GoogleIcon width={20} height={20} />}
                    variant='light'
                    onPress={() => {}}
                    style={styles.socialButton}
                  />
                  <SocialButton
                    label={loginStrings.githubSignIn}
                    icon={<GitHubIcon width={22} height={22} />}
                    variant='dark'
                    onPress={() => {}}
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.55,
  },
  blobTop: {
    top: -140,
    right: -120,
    width: 360,
    height: 360,
    backgroundColor: colors.primary[100],
  },
  blobBottom: {
    bottom: -160,
    left: -140,
    width: 320,
    height: 320,
    backgroundColor: '#E0E7FF',
    opacity: 0.4,
  },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  topSection: {
    alignItems: 'flex-start',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  brandBadge: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: -8,
    ...shadows.primaryButton,
  },
  verifyHeader: {
    marginTop: spacing.xl,
  },
  verifyTitle: {
    ...typography.heading,
    marginBottom: spacing.xs,
  },
  verifySubtitle: {
    ...typography.bodyRegular,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  socialSection: {
    marginTop: spacing.lg,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  separatorText: {
    ...typography.small,
    color: colors.text.muted,
  },
  socialButton: {
    marginBottom: spacing.md,
  },
  bottomSection: {},
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  switchPrompt: {
    ...typography.small,
    color: colors.text.secondary,
  },
  switchCta: {
    ...typography.small,
    color: colors.primary[600],
    fontFamily: 'Inter-SemiBold',
  },
});

export default LoginScreen;
