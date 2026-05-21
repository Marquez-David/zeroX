import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Formik } from 'formik';

import { registerStrings, validationStrings } from '@lib/strings';

import FormInput from '@components/CustomInputs/FormInput';
import PrimaryButton from '@components/CustomButtons/PrimaryButton';

import styles from './styles';

type RegisterValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterFormProps = {
  onSubmit: (values: RegisterValues) => Promise<void> | void;
};

const validate = (values: RegisterValues) => {
  const errors: Partial<RegisterValues> = {};
  if (!values.email) errors.email = validationStrings.requiredEmail;
  else if (!/\S+@\S+\.\S+/.test(values.email))
    errors.email = validationStrings.invalidEmail;

  if (!values.password) errors.password = validationStrings.requiredPassword;
  else if (values.password.length < 14)
    errors.password = validationStrings.invalidPassword;
  else if (/(.)\1{2,}/.test(values.password))
    errors.password = validationStrings.repeatedCharacters;

  if (!values.confirmPassword)
    errors.confirmPassword = validationStrings.requiredConfirmPassword;
  else if (values.confirmPassword !== values.password)
    errors.confirmPassword = validationStrings.passwordMismatch;

  return errors;
};

const RegisterForm = ({ onSubmit }: RegisterFormProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: RegisterValues) => {
    setLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{ email: '', password: '', confirmPassword: '' }}
      validate={validate}
      validateOnBlur={false}
      onSubmit={handleSubmit}
    >
      {({ handleChange, handleSubmit, values, errors, submitCount }) => (
        <View>
          <FormInput
            label={registerStrings.email}
            value={values.email}
            onChangeText={handleChange('email')}
            error={submitCount > 0 ? errors.email : undefined}
            placeholder='email@example.com'
            keyboardType='email-address'
            autoCapitalize='none'
            autoComplete='email'
          />
          <FormInput
            label={registerStrings.password}
            value={values.password}
            onChangeText={handleChange('password')}
            error={submitCount > 0 ? errors.password : undefined}
            placeholder='••••••••••••••'
            secureEntry
            autoComplete='password-new'
          />
          <Text style={styles.passwordHint}>{registerStrings.passwordHint}</Text>
          <FormInput
            label={registerStrings.confirmPassword}
            value={values.confirmPassword}
            onChangeText={handleChange('confirmPassword')}
            error={submitCount > 0 ? errors.confirmPassword : undefined}
            placeholder='••••••••••••••'
            secureEntry
            autoComplete='password-new'
          />
          <PrimaryButton
            title={registerStrings.submit}
            onPress={() => handleSubmit()}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      )}
    </Formik>
  );
};

export default RegisterForm;
