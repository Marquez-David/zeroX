import { use, createContext, type PropsWithChildren } from 'react';
import { useState } from 'react';

const AuthContext = createContext<{
  signIn: () => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState(null);
  return (
    <AuthContext
      value={{
        signIn: () => {
          setSession('session');
        },
        signOut: () => {
          setSession(null);
        },
        session: session,
        isLoading: false,
      }}
    >
      {children}
    </AuthContext>
  );
}
