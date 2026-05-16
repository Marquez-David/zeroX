import { StyleSheet } from 'react-native';

import { colors, radii, shadows, spacing, typography } from '@lib/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.cardGap,
    ...shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  month: {
    ...typography.body,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
  },
  meta: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  balance: {
    ...typography.body,
    fontFamily: 'Inter-Bold',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statAmountIncome: {
    ...typography.caption,
    fontFamily: 'Inter-SemiBold',
    color: colors.success[500],
    marginLeft: 'auto',
  },
  statAmountExpenses: {
    ...typography.caption,
    fontFamily: 'Inter-SemiBold',
    color: colors.error[500],
    marginLeft: 'auto',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
});

export default styles;
