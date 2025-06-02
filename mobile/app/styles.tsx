import { StyleSheet, StatusBar } from 'react-native';
import colors from '@app/utils/colors';

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
});

export default styles;
