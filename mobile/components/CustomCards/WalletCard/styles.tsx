import { StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '@lib/theme';

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balance: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  metaRow: {
    marginBottom: spacing.md,
  },
  metaText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  metaStrong: {
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
  },
  metaDivider: {
    color: colors.text.muted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoItem: {
    flex: 1,
    gap: 2,
    alignItems: 'flex-start',
  },
  infoDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  infoLabel: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  infoValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statActiveIncome: {
    backgroundColor: colors.success[50],
    borderColor: colors.success[500],
  },
  statActiveExpense: {
    backgroundColor: colors.error[50],
    borderColor: colors.error[500],
  },
  statDimmed: {
    opacity: 0.4,
  },
  statIconIncome: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: colors.success[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconExpense: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: colors.error[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    flexShrink: 1,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: 'Inter-Medium',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: colors.text.primary,
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
});

export default styles;
