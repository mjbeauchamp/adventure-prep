// ALLOWS CLIENT COMPONENTS TO ACCESS THE CURRENT AUTHENTICATION STATE
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { clientAuth, isFirebaseReady } from '@/lib/firebase/clientApp';
import toast, { Toaster } from 'react-hot-toast';

interface AuthProps {
    children: React.ReactNode;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export default function AuthorizationProvider({ children }: AuthProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const showToastError = (message: string) => toast(message, {
      className: 'toast-error',
  });

  useEffect(() => {
    if (isFirebaseReady() && clientAuth !== null) {
      const unsubscribe = onAuthStateChanged(clientAuth, (user) => {
        setUser(user);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      console.warn("Firebase not initialized. Skipping auth state subscription.");
      setLoading(false);
      showToastError("There is an issue with user profile features. User features will be unavailable at this time.");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <Toaster />
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): {user: User | null, loading: boolean} => useContext(AuthContext);
