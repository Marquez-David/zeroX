import { StyleSheet } from 'react-native';

import { colors, radii, typography, spacing } from '@lib/theme';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    height: 56,
  },
  inputFocused: {
    backgroundColor: colors.white,
    borderColor: colors.primary[600],
  },
  inputError: {
    borderColor: colors.error[500],
  },
  input: {
    flex: 1,
    ...typography.body,
    fontFamily: 'Inter-Regular',
    color: colors.text.primary,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: colors.error[500],
    marginTop: spacing.xs,
    marginLeft: spacing.md,
  },
});

export default styles;
