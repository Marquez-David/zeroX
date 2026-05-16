import { StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '@lib/theme';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
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
  },
  info: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
  },
  xpub: {
    ...typography.caption,
    fontFamily: 'Inter-Medium',
    color: colors.text.secondary,
    letterSpacing: 1,
    marginTop: 2,
  },
  deleteAction: {
    backgroundColor: colors.error[500],
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.cardGap,
    borderRadius: radii.lg,
  },
  deleteText: {
    ...typography.small,
    fontFamily: 'Inter-SemiBold',
    color: colors.white,
  },
});

export default styles;
