import { StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '@lib/theme';

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: 16,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  lightBg: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  darkBg: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  icon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.body,
    fontFamily: 'Inter-SemiBold',
  },
  lightLabel: {
    color: colors.text.primary,
  },
  darkLabel: {
    color: colors.white,
  },
});

export default styles;
