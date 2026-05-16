import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Formik } from 'formik';

import { loginStrings, validationStrings } from '@lib/strings';

import FormInput from '@components/CustomInputs/FormInput';
import PrimaryButton from '@components/CustomButtons/PrimaryButton';

import styles from './styles';

type LoginValues = {
  email: string;
  password: string;
};

type LoginFormProps = {
  onSubmit: (values: LoginValues) => Promise<void> | void;
  serverError?: string | null;
};

const validate = (values: LoginValues) => {
  const errors: Partial<LoginValues> = {};
  if (!values.email) errors.email = validationStrings.requiredEmail;
  else if (!/\S+@\S+\.\S+/.test(values.email))
    errors.email = validationStrings.invalidEmail;
  if (!values.password) errors.password = validationStrings.requiredPassword;
  return errors;
};

const LoginForm = ({ onSubmit, serverError }: LoginFormProps) => {
  const [loading, setLoading] = useState(false);

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validate={validate}
      validateOnBlur={false}
      onSubmit={async (values, { resetForm }) => {
        setLoading(true);
        try {
          await onSubmit(values);
        } catch {
          resetForm();
        } finally {
          setLoading(false);
        }
      }}
    >
      {({ handleChange, handleSubmit, values, errors, submitCount }) => (
        <View>
          {serverError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{serverError}</Text>
            </View>
          )}
          <FormInput
            label={loginStrings.email}
            value={values.email}
            onChangeText={handleChange('email')}
            error={submitCount > 0 ? errors.email : undefined}
            placeholder='email@example.com'
            keyboardType='email-address'
            autoCapitalize='none'
            autoComplete='email'
          />
          <FormInput
            label={loginStrings.password}
            value={values.password}
            onChangeText={handleChange('password')}
            error={submitCount > 0 ? errors.password : undefined}
            placeholder='••••••••••••••'
            secureEntry
            autoComplete='password'
          />
          <PrimaryButton
            title={loginStrings.enter}
            onPress={() => handleSubmit()}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      )}
    </Formik>
  );
};

export default LoginForm;
