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
import { useAddWalletMutation } from '@hooks/queries/wallets';
import { ApiError } from '@lib/api';
import { walletsSettingsStrings } from '@lib/strings';
import { colors, spacing, typography } from '@lib/theme';

type FormValues = { xpub: string };

const validate = (values: FormValues) => {
  const errors: Partial<FormValues> = {};
  if (!values.xpub.trim()) errors.xpub = walletsSettingsStrings.requiredXpub;
  return errors;
};

const AddWalletScreen = () => {
  const router = useRouter();
  const mutation = useAddWalletMutation();
  const insets = useSafeAreaInsets();
  const [serverError, setServerError] = React.useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{walletsSettingsStrings.addTitle}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <Formik<FormValues>
          initialValues={{ xpub: '' }}
          validate={validate}
          onSubmit={async (values, helpers) => {
            setServerError(null);
            try {
              await mutation.mutateAsync(values.xpub.trim());
              router.back();
            } catch (err) {
              const msg = err instanceof ApiError ? err.message : 'Could not add wallet';
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
                  label={walletsSettingsStrings.xpubLabel}
                  value={values.xpub}
                  onChangeText={handleChange('xpub')}
                  placeholder={walletsSettingsStrings.xpubPlaceholder}
                  autoCapitalize='none'
                  autoCorrect={false}
                  error={submitCount > 0 ? errors.xpub : undefined}
                />
                <Text style={styles.helper}>{walletsSettingsStrings.helper}</Text>
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
                  title={walletsSettingsStrings.submit}
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
  helper: {
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

export default AddWalletScreen;
