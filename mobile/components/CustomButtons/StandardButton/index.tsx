import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';

import styles from './styles';

type StandardButtonProps = {
  button: { style: ViewStyle; logo: any };
  label: { style: TextStyle; text: string };
  onPress: () => void;
};

const StandardButton = ({ button, label, onPress }: StandardButtonProps) => (
  <View style={styles.buttonView}>
    <TouchableOpacity style={button.style} onPress={onPress}>
      {button.logo && button.logo}
      <Text style={label.style}>{label.text}</Text>
    </TouchableOpacity>
  </View>
);

export default StandardButton;
