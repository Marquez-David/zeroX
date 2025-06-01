import { StyleSheet } from 'react-native';
import colors from '@app/utils/colors';

const styles = StyleSheet.create({
  view: {
    marginVertical: 6,
  },
  label: {
    color: colors.gray100,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  filedContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  icon: {
    zIndex: 10,
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  field: {
    color: colors.gray100,
    borderColor: colors.gray500,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    borderRadius: 15,
    borderWidth: 1,
    paddingLeft: 10,
    paddingRight: 40,
    marginVertical: 4,
  },
  error: {
    color: colors.red400,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});

export default styles;
