import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import { ChevronLeft } from 'lucide-react-native';

import FormInput from '@components/CustomInputs/FormInput';
import PrimaryButton from '@components/CustomButtons/PrimaryButton';
import { useChangePasswordMutation } from '@hooks/queries/users';
import { ApiError } from '@lib/api';
import { changePasswordStrings, validationStrings } from '@lib/strings';
import { colors, spacing, typography } from '@lib/theme';

type FormValues = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const validate = (values: FormValues) => {
  const errors: Partial<Record<keyof FormValues, string>> = {};
  if (!values.oldPassword) errors.oldPassword = validationStrings.requiredPassword;
  if (!values.newPassword) errors.newPassword = validationStrings.requiredPassword;
  else if (values.newPassword.length < 14)
    errors.newPassword = validationStrings.invalidPassword;
  else if (/(.)\1{2,}/.test(values.newPassword))
    errors.newPassword = validationStrings.repeatedCharacters;
  if (!values.confirmPassword)
    errors.confirmPassword = validationStrings.requiredConfirmPassword;
  else if (values.confirmPassword !== values.newPassword)
    errors.confirmPassword = validationStrings.passwordMismatch;
  return errors;
};

const ChangePasswordScreen = () => {
  const router = useRouter();
  const mutation = useChangePasswordMutation();
  const insets = useSafeAreaInsets();
  const [serverError, setServerError] = React.useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{changePasswordStrings.title}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <Formik<FormValues>
          initialValues={{ oldPassword: '', newPassword: '', confirmPassword: '' }}
          validate={validate}
          onSubmit={async (values, helpers) => {
            setServerError(null);
            try {
              await mutation.mutateAsync({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword,
              });
              router.back();
            } catch (err) {
              const msg = err instanceof ApiError ? err.message : 'Could not update password';
              setServerError(msg);
            } finally {
              helpers.setSubmitting(false);
            }
          }}
        >
          {({ handleChange, handleSubmit, values, errors, submitCount, isSubmitting }) => (
            <>
              <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps='handled'
              >
                <FormInput
                  label={changePasswordStrings.current}
                  value={values.oldPassword}
                  onChangeText={handleChange('oldPassword')}
                  secureEntry
                  autoCapitalize='none'
                  autoComplete='current-password'
                  error={submitCount > 0 ? errors.oldPassword : undefined}
                />
                <FormInput
                  label={changePasswordStrings.new}
                  value={values.newPassword}
                  onChangeText={handleChange('newPassword')}
                  secureEntry
                  autoCapitalize='none'
                  autoComplete='password-new'
                  error={submitCount > 0 ? errors.newPassword : undefined}
                />
                <Text style={styles.hint}>{changePasswordStrings.hint}</Text>
                <FormInput
                  label={changePasswordStrings.confirm}
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  secureEntry
                  autoCapitalize='none'
                  autoComplete='password-new'
                  error={submitCount > 0 ? errors.confirmPassword : undefined}
                />
                {serverError ? <Text style={styles.error}>{serverError}</Text> : null}
              </ScrollView>
              <View
                style={[
                  styles.footer,
                  {
                    paddingBottom:
                      Math.max(insets.bottom, spacing.lg) + spacing.xs,
                  },
                ]}
              >
                <PrimaryButton
                  title={changePasswordStrings.submit}
                  onPress={() => handleSubmit()}
                  loading={isSubmitting || mutation.isPending}
                />
              </View>
            </>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  back: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  title: {
    ...typography.heading,
  },
  scroll: {
    padding: spacing.screenPadding,
    gap: spacing.md,
  },
  hint: {
    ...typography.caption,
    color: colors.text.muted,
  },
  error: {
    ...typography.small,
    color: colors.error[500],
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.screenPadding,
  },
});

export default ChangePasswordScreen;
