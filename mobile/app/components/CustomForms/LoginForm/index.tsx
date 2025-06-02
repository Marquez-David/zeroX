import React from 'react';
import { Formik } from 'formik';

import { loginStrings } from '@app/utils/strings';

import StandardInput from '@app/components/CustomInputs/StandardInput';
import StandardButton from '@app/components/CustomButtons/StandardButton';

import { validateEmail, validatePassword } from '@app/utils/utils';

import styles from './styles';

const LoginForm = () => {
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      onSubmit={(values) => console.log(values)}
      validate={(values) => {
        const errors: { email?: string; password?: string } = {};
        errors.email = validateEmail(values.email);
        errors.password = validatePassword(values.password);
        return errors;
      }}
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
            type={'email-address'}
            validation={{ touched: touched.email, error: errors.email }}
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
          />
          <StandardInput
            value={values.password}
            label={loginStrings.password}
            type={'password'}
            validation={{ touched: touched.password, error: errors.password }}
            onChange={handleChange('password')}
            onBlur={handleBlur('password')}
          />
          <StandardButton
            button={{ style: styles.submitButton }}
            title={{ text: loginStrings.emailSignUp, style: styles.titleText }}
            onPress={handleSubmit}
          />
        </>
      )}
    </Formik>
  );
};

export default LoginForm;
