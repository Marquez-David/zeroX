import { StyleSheet } from 'react-native';

import { colors, radii, shadows, spacing, typography } from '@lib/theme';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  cardShadow: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radii.xl,
    ...shadows.cardHover,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
    overflow: 'hidden',
  },
  iconCircle: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 56 / 2,
    backgroundColor: colors.error[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.sectionTitle,
    textAlign: 'center',
  },
  body: {
    ...typography.bodyRegular,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surfaceMuted,
  },
  cancelLabel: {
    ...typography.body,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
  },
  destructiveButton: {
    backgroundColor: colors.error[500],
  },
  destructiveLabel: {
    ...typography.body,
    fontFamily: 'Inter-SemiBold',
    color: colors.white,
  },
  primaryButton: {
    backgroundColor: colors.primary[600],
  },
  primaryLabel: {
    ...typography.body,
    fontFamily: 'Inter-SemiBold',
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default styles;
