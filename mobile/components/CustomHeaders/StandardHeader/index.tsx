import { View } from 'react-native';
import Logo from '@assets/icons/Logo';
import styles from './styles';

const StandardHeader = () => (
  <View style={styles.header}>
    <Logo width={250} height={35} />
  </View>
);

export default StandardHeader;
