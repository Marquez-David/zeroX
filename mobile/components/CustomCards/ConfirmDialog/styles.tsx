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
    overflow: 'hidden',
  },
  header: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.sectionTitle,
    color: colors.white,
    textAlign: 'center',
  },
  bodySection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  body: {
    ...typography.bodyRegular,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  buttonsNoBody: {
    paddingTop: spacing.lg,
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
});

export default styles;
