import { StyleSheet } from 'react-native';

import { colors, radii, shadows, typography } from '@lib/theme';

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: radii.pill,
    ...shadows.primaryButton,
  },
  touchable: {
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    borderRadius: radii.pill,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBg: {
    backgroundColor: colors.surfaceMuted,
  },
  dangerBg: {
    backgroundColor: colors.error[50],
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.body,
    fontFamily: 'Inter-SemiBold',
  },
});

export default styles;
