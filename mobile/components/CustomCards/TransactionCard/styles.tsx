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
  concept: {
    ...typography.body,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
    flexShrink: 1,
  },
  amount: {
    ...typography.body,
    fontFamily: 'Inter-Bold',
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    flexShrink: 1,
  },
  chipText: {
    ...typography.caption,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
    flexShrink: 1,
    minWidth: 0,
  },
  separator: {
    ...typography.caption,
    color: colors.text.muted,
  },
  date: {
    ...typography.caption,
    color: colors.text.muted,
  },
});

export default styles;
