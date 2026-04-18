import { StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '@lib/theme';

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.screenPadding,
    marginBottom: spacing.sectionGap,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceMuted,
  },
  heroRow: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroLabel: {
    ...typography.small,
    color: colors.text.secondary,
  },
  heroValue: {
    fontSize: 40,
    lineHeight: 44,
    fontFamily: 'Inter-Bold',
    letterSpacing: -1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statActiveIncome: {
    backgroundColor: colors.success[50],
    borderColor: colors.success[500],
  },
  statActiveExpenses: {
    backgroundColor: colors.error[50],
    borderColor: colors.error[500],
  },
  statDimmed: {
    opacity: 0.4,
  },
  iconCircleIncome: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success[50],
  },
  iconCircleExpenses: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error[50],
  },
  statTextBlock: {
    flexShrink: 1,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statAmount: {
    ...typography.body,
    fontFamily: 'Inter-Bold',
  },
  verticalDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
});

export default styles;
