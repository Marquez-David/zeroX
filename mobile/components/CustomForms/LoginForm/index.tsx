import React from 'react';
import { Formik } from 'formik';

import { loginStrings } from '@lib/strings';

import StandardInput from '@components/CustomInputs/StandardInput';
import StandardButton from '@components/CustomButtons/StandardButton';

import { validateEmail, validatePassword } from '@lib/utils';

import styles from './styles';

type LoginFormProps = {
  onSubmit: () => void;
};

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      onSubmit={(values) => onSubmit()}
      // validate={(values) => {
      //   const errors: { email?: string; password?: string } = {};
      //   errors.email = validateEmail(values.email);
      //   errors.password = validatePassword(values.password);
      //   return errors;
      // }}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
      }) => (
        <>
          <StandardInput
            value={values.email}
            label={loginStrings.email}
            isPassword={false}
            validation={{ touched: touched.email, error: errors.email }}
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
          />
          <StandardInput
            value={values.password}
            label={loginStrings.password}
            isPassword={true}
            validation={{ touched: touched.password, error: errors.password }}
            onChange={handleChange('password')}
            onBlur={handleBlur('password')}
          />
          <StandardButton
            button={{ logo: null, style: styles.submitButton }}
            label={{ text: loginStrings.emailSignUp, style: styles.titleText }}
            onPress={handleSubmit}
          />
        </>
      )}
    </Formik>
  );
};

export default LoginForm;
