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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import { ChevronLeft } from 'lucide-react-native';

import FormInput from '@components/CustomInputs/FormInput';
import PrimaryButton from '@components/CustomButtons/PrimaryButton';
import { useSession } from '@contexts/auth';
import { useChangeUsernameMutation } from '@hooks/queries/users';
import { ApiError } from '@lib/api';
import { changeUsernameStrings } from '@lib/strings';
import { colors, spacing, typography } from '@lib/theme';

type FormValues = { username: string };

const validate = (values: FormValues) => {
  const errors: Partial<FormValues> = {};
  const trimmed = values.username.trim();
  if (!trimmed) errors.username = changeUsernameStrings.requiredUsername;
  else if (trimmed.length < 3) errors.username = changeUsernameStrings.invalidUsername;
  return errors;
};

const ChangeUsernameScreen = () => {
  const router = useRouter();
  const { user } = useSession();
  const mutation = useChangeUsernameMutation();
  const [serverError, setServerError] = React.useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{changeUsernameStrings.title}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <Formik<FormValues>
          initialValues={{ username: user?.username ?? '' }}
          validate={validate}
          onSubmit={async (values, helpers) => {
            setServerError(null);
            try {
              await mutation.mutateAsync(values.username.trim());
              router.back();
            } catch (err) {
              const msg = err instanceof ApiError ? err.message : 'Could not update username';
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
                  label={changeUsernameStrings.label}
                  value={values.username}
                  onChangeText={handleChange('username')}
                  autoCapitalize='none'
                  autoCorrect={false}
                  error={submitCount > 0 ? errors.username : undefined}
                />
                {serverError ? <Text style={styles.error}>{serverError}</Text> : null}
              </ScrollView>
              <View style={styles.footer}>
                <PrimaryButton
                  title={changeUsernameStrings.submit}
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
  error: {
    ...typography.small,
    color: colors.error[500],
    textAlign: 'center',
  },
  footer: {
    padding: spacing.screenPadding,
    paddingBottom: spacing.lg,
  },
});

export default ChangeUsernameScreen;
