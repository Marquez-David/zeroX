import { StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '@lib/theme';

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.screenPadding,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceMuted,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.small,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
  },
  month: {
    ...typography.caption,
    color: colors.primary[600],
    fontFamily: 'Inter-Medium',
  },
  bar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: radii.sm,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.gray[200],
  },
  incomeFill: {
    backgroundColor: colors.success[500],
    height: '100%',
  },
  expensesFill: {
    backgroundColor: colors.error[500],
    height: '100%',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconCircleIncome: {
    width: 26,
    height: 26,
    borderRadius: radii.full,
    backgroundColor: colors.success[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleExpenses: {
    width: 26,
    height: 26,
    borderRadius: radii.full,
    backgroundColor: colors.error[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  legendAmount: {
    ...typography.small,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
  },
});

export default styles;
