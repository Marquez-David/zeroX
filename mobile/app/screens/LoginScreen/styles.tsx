import { StyleSheet } from 'react-native';
import colors from '@app/utils/colors';

const styles = StyleSheet.create({
  fade: {
    borderRadius: 50,
    shadowColor: colors.gray800,
    shadowOpacity: 0.1,
    elevation: 1,
  },
  whiteButton: {
    borderRadius: 50,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.white,
  },
  blackButton: {
    borderRadius: 50,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.gray950,
    borderTopWidth: 0.1,
    borderLeftWidth: 0.25,
    borderColor: colors.gray700,
  },
  blackText: {
    color: colors.gray900,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 10,
  },
  whiteText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 10,
  },
  whiteBoldText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  grayText: {
    textAlign: 'center',
    color: colors.gray100,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});

export default styles;
