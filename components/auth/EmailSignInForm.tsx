'use client'

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { clientAuth } from '@/lib/firebase/clientApp';
import styles from './EmailSignInForm.module.scss';

export default function EmailSignInForm(props: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firebaseError, setFirebaseError] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
      await createUserWithEmailAndPassword(clientAuth, email, password);
      setSubmitted(true);
    } catch (error: any) {
      const message = mapFirebaseError(error.code);
      setFirebaseError(message);
    }
  };

  const mapFirebaseError = (code: string) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already in use.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/weak-password':
        return 'Password is too weak.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label>
        Email:
        <input className="w-full border border-green-700 rounded-sm hover:border-green-900 p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>

      <label>
        Password:
        <input className="w-full border border-green-700 rounded-sm hover:border-green-900 p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>

      {firebaseError && <p className={styles.error}>{firebaseError}</p>}
      {submitted && <p className={styles.success}>🎉 Account created successfully!</p>}

      <button className={styles.button}  type="submit">Create Account</button>
      <button className={styles.button}  onClick={props.goBack}>Go Back</button>
    </form>
  );
}
