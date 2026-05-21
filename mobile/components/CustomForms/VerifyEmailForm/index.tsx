import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';

import { verifyStrings, validationStrings } from '@lib/strings';

import FormInput from '@components/CustomInputs/FormInput';
import PrimaryButton from '@components/CustomButtons/PrimaryButton';

import styles from './styles';

type VerifyValues = {
  code: string;
};

type VerifyEmailFormProps = {
  email: string;
  onSubmit: (values: VerifyValues) => Promise<void> | void;
  onResend: () => Promise<void> | void;
  onChangeEmail: () => void;
};

const validate = (values: VerifyValues) => {
  const errors: Partial<VerifyValues> = {};
  const code = values.code.trim();
  if (!code) errors.code = validationStrings.requiredCode;
  else if (code.length !== 6 || !/^\d{6}$/.test(code))
    errors.code = validationStrings.invalidCodeLength;
  return errors;
};

const VerifyEmailForm = ({
  email,
  onSubmit,
  onResend,
  onChangeEmail,
}: VerifyEmailFormProps) => {
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const handleSubmit = async (values: VerifyValues) => {
    setLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResent(false);
    try {
      await onResend();
      setResent(true);
    } catch {
      // swallow — form error banner will carry any real error later
    }
  };

  return (
    <Formik
      initialValues={{ code: '' }}
      validate={validate}
      validateOnBlur={false}
      onSubmit={handleSubmit}
    >
      {({ handleChange, handleSubmit, values, errors, submitCount }) => (
        <View>
          <Text style={styles.emailTarget}>{email}</Text>

          <FormInput
            label={verifyStrings.label}
            value={values.code}
            onChangeText={(text) =>
              handleChange('code')(text.replace(/\D/g, '').slice(0, 6))
            }
            error={submitCount > 0 ? errors.code : undefined}
            placeholder='••••••'
            keyboardType='number-pad'
            autoComplete='one-time-code'
            maxLength={6}
          />

          <PrimaryButton
            title={verifyStrings.submit}
            onPress={() => handleSubmit()}
            loading={loading}
            style={styles.submitButton}
          />

          <View style={styles.resendRow}>
            <Text style={styles.resendPrompt}>
              {resent ? verifyStrings.resendSent : verifyStrings.resendPrompt}
            </Text>
            {!resent && (
              <TouchableOpacity onPress={handleResend} hitSlop={8}>
                <Text style={styles.resendCta}>{verifyStrings.resendCta}</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={onChangeEmail}
            hitSlop={8}
            style={styles.changeEmail}
          >
            <Text style={styles.changeEmailText}>
              {verifyStrings.changeEmail}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Formik>
  );
};

export default VerifyEmailForm;
