import { StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '@lib/theme';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  first: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
  last: {
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
  },
  divider: {
    height: 1,
    marginLeft: spacing.lg + 36 + spacing.md,
    backgroundColor: colors.border,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[50],
  },
  iconCircleDanger: {
    backgroundColor: colors.error[50],
  },
  label: {
    ...typography.body,
    fontFamily: 'Inter-SemiBold',
    color: colors.text.primary,
    flexShrink: 1,
  },
  labelDanger: {
    color: colors.error[500],
  },
  value: {
    ...typography.small,
    color: colors.text.muted,
    marginLeft: 'auto',
    maxWidth: 180,
  },
});

export default styles;
