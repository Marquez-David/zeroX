import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';

import EyeButton from '@app/components/CustomButtons/EyeButton';

import styles from './styles';

const StandardInput = ({
  value,
  label,
  type,
  validation,
  onChange,
  onBlur,
}) => {
  const [secureEntry, setSecureEntry] = useState(type === 'password');
  return (
    <View style={styles.view}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.filedContainer}>
        <EyeButton
          display={type === 'password' && value !== ''}
          active={secureEntry}
          button={{ style: styles.icon }}
          onPress={() => {
            setSecureEntry(!secureEntry);
          }}
        />
        <TextInput
          style={styles.field}
          keyboardType={type}
          secureTextEntry={secureEntry}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
        />
      </View>
      {validation.touched && validation.error && (
        <Text style={styles.error}>{validation.error}</Text>
      )}
    </View>
  );
};

export default StandardInput;
