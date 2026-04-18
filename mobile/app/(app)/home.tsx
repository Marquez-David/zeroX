import React from 'react';
import { View, Text, Button } from 'react-native';

import { useLogoutMutation } from '@hooks/queries/auth';

const Home = () => {
  const logoutMutation = useLogoutMutation();

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text>HOME SCREEN</Text>
      <Button
        title='Logout'
        onPress={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
      />
    </View>
  );
};

export default Home;
