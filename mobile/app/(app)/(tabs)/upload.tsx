import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@lib/theme';

// Placeholder route. The actual upload flow is triggered from the floating
// "+" button in `FloatingTabBar` via `expo-document-picker`, so this screen
// is rarely reached — it stays registered so Expo Router's typed routes
// don't complain about the existing `(tabs)/upload` file.
const UploadScreen = () => (
  <SafeAreaView style={styles.container} edges={['top']}>
    <View style={styles.body}>
      <Text style={styles.title}>Upload</Text>
      <Text style={styles.subtitle}>
        Tap the + button in the tab bar to pick an Excel report from your
        device.
      </Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  body: {
    flex: 1,
    padding: spacing.screenPadding,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.heading,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyRegular,
    textAlign: 'center',
  },
});

export default UploadScreen;
