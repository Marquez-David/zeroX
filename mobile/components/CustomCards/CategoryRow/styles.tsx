import { StyleSheet } from 'react-native';

import { colors, radii, shadows, spacing, typography } from '@lib/theme';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.cardGap,
    ...shadows.card,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
    gap: spacing.sm,
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  pillText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
  },
  name: {
    ...typography.body,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
    flexShrink: 1,
  },
  amount: {
    ...typography.body,
    fontFamily: 'Inter-Bold',
    color: colors.error[500],
  },
  meta: {
    ...typography.caption,
    color: colors.text.muted,
  },
  progressTrack: {
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.gray[100],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
});

export default styles;
