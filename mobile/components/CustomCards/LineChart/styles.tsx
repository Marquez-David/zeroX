import { StyleSheet } from 'react-native';

import { colors, typography } from '@lib/theme';

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.text.muted,
  },
});

export default styles;
