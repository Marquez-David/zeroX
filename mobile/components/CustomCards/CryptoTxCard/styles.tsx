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
    alignItems: 'flex-start',
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
  headerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  date: {
    ...typography.body,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
  },
  counterparty: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
  counterpartyLabel: {
    ...typography.caption,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amount: {
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
  statAmount: {
    ...typography.caption,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
    marginLeft: 'auto',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
  },
});

export default styles;
