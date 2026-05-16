import { StyleSheet } from 'react-native';

import { colors, typography } from '@lib/theme';

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  emptyText: {
    ...typography.bodyRegular,
    textAlign: 'center',
    color: colors.text.muted,
    paddingVertical: 40,
  },
});

export default styles;
