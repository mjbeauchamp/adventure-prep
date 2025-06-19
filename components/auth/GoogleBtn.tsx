"use client";

import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import toast, { Toaster } from 'react-hot-toast';
import { clientAuth, isFirebaseReady } from '@/lib/firebase/clientApp';
import { handleServerLogin } from '@/lib/firebase/actions/userServerLogin';
import styles from './GoogleBtn.module.scss';

const provider = new GoogleAuthProvider();

export default function GoogleLoginButton(props: any) {
  const [isLoading, setIsLoading] = useState(false);
  const showToastError = (message: string) => toast(message, {
    className: 'toast-error',
  });

  const handleLogin = async () => {
    if (!isFirebaseReady) {
      console.warn("Firebase not initialized. Skipping auth state subscription.");
      showToastError("There is an issue with user profile features. User features will be unavailable at this time.");
    }

    setIsLoading(true);
    try {
      let user; 

      if (clientAuth) {
        const result = await signInWithPopup(clientAuth, provider);
        user = result.user;
      }

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
          props.closeLoginDialog(); // Close the login dialog if successful
        } catch (error) {
          if (clientAuth) {
            await clientAuth.signOut();
          }
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
    <div className='w-full'>
      <Toaster />
      <button className={styles.gsiMaterialButton} onClick={handleLogin} disabled={isLoading} aria-label="Sign in with Google">
        <div className={styles.gsiMaterialButtonState}></div>
          <div className={styles.gsiMaterialButtonContentWrapper}>
          <div className={styles.gsiMaterialButtoIcon}>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{display: 'block'}}>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
          </div>
          <span className={styles.gsiMaterialButtonContents}>{isLoading ? 'Signing In...' : 'Sign in with Google'}</span>
          <span style={{display: 'none'}}>Sign in with Google</span>
        </div>
      </button>
    </div>
  );
}
