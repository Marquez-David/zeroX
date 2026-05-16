import { StyleSheet } from 'react-native';

import { colors, radii, spacing, typography } from '@lib/theme';

const styles = StyleSheet.create({
  errorBanner: {
    backgroundColor: colors.error[50],
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorBannerText: {
    ...typography.small,
    color: colors.error[500],
    textAlign: 'center',
  },
  submitButton: {
    marginTop: spacing.md,
  },
});

export default styles;
