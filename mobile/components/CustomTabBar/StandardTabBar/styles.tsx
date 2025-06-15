import { StyleSheet } from 'react-native';
import colors from '@lib/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: colors.gray700,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderRadius: 50,
  },
});

export default styles;
