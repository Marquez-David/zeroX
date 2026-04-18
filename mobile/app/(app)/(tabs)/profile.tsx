import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

import { useLogoutMutation } from '@hooks/queries/auth';
import { profileStrings } from '@lib/strings';
import { colors, spacing, typography } from '@lib/theme';

const Profile = () => {
  const logoutMutation = useLogoutMutation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{profileStrings.title}</Text>
      <Button
        title={profileStrings.logout}
        onPress={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
        color={colors.error[500]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.screenPadding,
    gap: spacing.lg,
  },
  title: {
    ...typography.heading,
  },
});

export default Profile;
