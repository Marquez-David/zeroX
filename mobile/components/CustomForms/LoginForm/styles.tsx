import { StyleSheet } from 'react-native';
import colors from '@lib/colors';

const styles = StyleSheet.create({
  submitButton: {
    borderRadius: 50,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.green500,
    borderTopWidth: 0.25,
    borderLeftWidth: 0.25,
    borderColor: colors.green400,
  },
  titleText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 10,
  },
});

export default styles;
