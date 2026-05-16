import { StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '@lib/theme';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.cardGap,
    gap: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  iconText: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    letterSpacing: -0.5,
  },
  xpub: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  sub: {
    ...typography.caption,
    fontFamily: 'Inter-Regular',
    color: colors.text.muted,
  },
  badge: {
    backgroundColor: colors.primary[100],
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: colors.primary[700],
    letterSpacing: 0.8,
  },
});

export default styles;
