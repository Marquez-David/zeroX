import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import styles from './styles';

const StandardButton = ({ button, title, onPress }) => (
  <View style={styles.buttonView}>
    <TouchableOpacity style={button.style} onPress={onPress}>
      {button.logo && button.logo}
      <Text style={title.style}>{title.text}</Text>
    </TouchableOpacity>
  </View>
);

export default StandardButton;
