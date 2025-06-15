import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';

import EyeButton from '@components/CustomButtons/EyeButton';

import styles from './styles';

type StandardInputProps = {
  value: string;
  label: string;
  isPassword: boolean;
  validation: { touched: boolean | undefined; error: string | undefined };
  onChange: (text: string) => void;
  onBlur: (e: any) => void;
};

const StandardInput = ({
  value,
  label,
  isPassword,
  validation,
  onChange,
  onBlur,
}: StandardInputProps) => {
  const [secureEntry, setSecureEntry] = useState(isPassword);
  return (
    <View style={styles.view}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.filedContainer}>
        <EyeButton
          display={isPassword && value !== ''}
          active={secureEntry}
          button={{ style: styles.icon }}
          onPress={() => {
            setSecureEntry(!secureEntry);
          }}
        />
        <TextInput
          style={styles.field}
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
