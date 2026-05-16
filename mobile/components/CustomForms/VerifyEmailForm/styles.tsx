import { StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '@lib/theme';

const styles = StyleSheet.create({
  emailTarget: {
    ...typography.body,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  errorBanner: {
    backgroundColor: colors.error[50],
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorBannerText: {
    ...typography.small,
    color: colors.error[500],
    textAlign: 'center',
  },
  submitButton: {
    marginTop: spacing.md,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  resendPrompt: {
    ...typography.small,
    color: colors.text.secondary,
  },
  resendCta: {
    ...typography.small,
    color: colors.primary[600],
    fontFamily: 'Inter-SemiBold',
  },
  changeEmail: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  changeEmailText: {
    ...typography.caption,
    color: colors.text.muted,
  },
});

export default styles;
