'use client'

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { clientAuth, isFirebaseReady } from '@/lib/firebase/clientApp';
import styles from './EmailSignInForm.module.scss';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from "../auth/AuthorizationProvider";

export default function EmailSignInForm(props: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, updateDisplayText] = useState('');
  const [firebaseError, setFirebaseError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showExistingUserLogin, setShowExistingUserLogin] = useState(true);

  const { setUser, setDisplayName } = useAuth();

  const showToastError = (message: string) => toast(message, {
      className: 'toast-error',
  });

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (pw: string) =>
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[!@#$%^&*]/.test(pw);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFirebaseError('');

    if (!isFirebaseReady()) {
      console.error('Profile Manager - Email Sign In Form: Firebase was not initiated correctly on page load');
      showToastError("There is an issue with user profile features. User features are unavailable at this time.");
      return;
    }

    if (!validateEmail(email)) {
      setFirebaseError('Please enter a valid email address.');
      return;
    }
    if (!validatePassword(password)) {
      setFirebaseError(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      );
      return;
    }

    try {
      if (clientAuth && !showExistingUserLogin) {
        const userCredential = await createUserWithEmailAndPassword(clientAuth, email, password);
        if (userCredential && displayName ) {
          await updateProfile(userCredential.user, { displayName });
          await clientAuth.currentUser?.reload();
          setUser(clientAuth.currentUser);
          setDisplayName(displayName);
        }
        setSubmitted(true);
      } else if (clientAuth && showExistingUserLogin) {
        await signInWithEmailAndPassword(clientAuth, email, password);
      } else {
        console.error('Profile Manager - Email Sign In Form: Firebase was not initiated correctly on page load');
        showToastError("There is an issue with user profile features. User features are unavailable at this time.");
      }
    } catch (error: any) {
      const message = mapFirebaseError(error.code);
      setFirebaseError(message);
    }
  };

  const mapFirebaseError = (code: string) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already in use.';
      case 'auth/invalid-credential':
        return 'Invalid email address. Please create an account.';
      case 'auth/weak-password':
        return 'Password is too weak.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  return (
    <>
      <Toaster />
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Email:
          <input className="w-full border border-green-700 rounded-sm hover:border-green-900 p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Password:
          <input className="w-full border border-green-700 rounded-sm hover:border-green-900 p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        {!showExistingUserLogin ? <label>
          Display name (optional):
          <input className="w-full border border-green-700 rounded-sm hover:border-green-900 p-2" type="text" value={displayName} onChange={(e) => updateDisplayText(e.target.value)} />
        </label> : null}

        <div>
          {showExistingUserLogin ? <p>Don't have an account yet? <button onClick={() => setShowExistingUserLogin(false)}>Create One!</button></p> : null}
          {!showExistingUserLogin ? <p>Already have an account? <button onClick={() => setShowExistingUserLogin(true)}>Sign In</button></p> : null}
        </div>

        {firebaseError && <p className={styles.warning}>{firebaseError}</p>}
        {submitted && <p className={styles.success}>🎉 Account created successfully!</p>}

        {!showExistingUserLogin ? <button className={styles.button}  type="submit">Create Account</button> : null}
        {showExistingUserLogin ? <button className={styles.button}  type="submit">Sign In</button> : null}
        <button className={styles.button}  onClick={props.goBack}>Go Back</button>
      </form>
    </>
  );
}
