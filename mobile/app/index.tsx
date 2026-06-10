import { Redirect } from 'expo-router';

import { useSession } from '@contexts/auth';

const Index = () => {
  const { session, isLoading } = useSession();
  if (isLoading) return null;
  return <Redirect href={session ? '/(app)/(tabs)/home' : '/login'} />;
};

export default Index;
