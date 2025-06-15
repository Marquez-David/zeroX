import { StyleSheet } from 'react-native';
import colors from '@lib/colors';

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    backgroundColor: colors.secondaryPurple,
    borderRadius: 50,
    width: '35%',
    height: '55%',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  label: {
    color: colors.white,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
});

export default styles;
