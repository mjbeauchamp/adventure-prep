"use client";

import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import toast, { Toaster } from 'react-hot-toast';
import { clientAuth } from '@/lib/firebase/clientApp';
import { handleServerLogin } from '@/lib/firebase/actions/userLogin';

const provider = new GoogleAuthProvider();

export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const showToastError = (message: string) => toast(message, {
    className: 'toast-error',
  });

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(clientAuth, provider);
      const user = result.user;

      if (user) {
        const idToken = await user.getIdToken();


        // Call handleServerLogin to set the session cookie to 'login' the user on the server
        // User database profile will be created or updated in ProfileManager.tsx once site AuthContext
        // updates on successful login
        try {
          await handleServerLogin(idToken, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
        } catch (error) {
          await clientAuth.signOut();
          showToastError("Login: There was an error setting user session cookie. User features will be unavailable.");
        }
      } else {
         showToastError(`Whoops! Sign-in failed: No user returned.`);
      }

    } catch (error) {
        console.error("Login failed:", error);
        showToastError(`Whoops! There was an error logging in: ${error instanceof Error ? error.message : error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Toaster />
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? 'Signing In...' : 'Sign In'}
      </button>
    </div>
  );
}
