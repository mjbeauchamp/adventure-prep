'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthorizationProvider';
import { userLogout } from '@/lib/firebase/actions/userServerLogout';
import toast, { Toaster } from 'react-hot-toast';
import { clientAuth, clientDatabase, isFirebaseReady } from '@/lib/firebase/clientApp';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface ProfileManagerProps {
    children: React.ReactNode;
}

export default function ProfileManager({ children }: ProfileManagerProps) {
    const showToastError = (message: string) => toast(message, {
        className: 'toast-error',
    });
    const { user, loading }: {user: User | null, loading: boolean} = useAuth();
    // processedUserId tracks if the profile processing has already been completed for initial login.
    // This prevents re-processing on re-renders or token refreshes for the same user.
    const [processedUserId, setProcessedUserId] = useState<string | null>(null);

    const processUserProfile = async (user: User) => {
        try {
            if (clientDatabase === null ) {
                console.error("Profile Manager: Error creating/updating Firestore user profile");
                userLogout(); // Calls the logout function to clear cookie session set during client login
                setProcessedUserId(null);
                showToastError("Profile Manager: Error with user sign up or login. User features will be unavailable.");
                return;
            }

            await runTransaction(clientDatabase, async (transaction) => {
                const userDocRef = doc(clientDatabase!, 'users', user.uid);
                const userDoc = await transaction.get(userDocRef);

                if (!userDoc.exists()) {
                    // User document does NOT exist, add new user
                    transaction.set(userDocRef, {
                        uid: user.uid,
                        email: user.email || null,
                        displayName: user.displayName || null,
                        photoURL: user.photoURL || null,
                        createdAt: serverTimestamp(),
                        lastLoginAt: serverTimestamp(), 
                    }, { merge: false });

                    console.log(`ProfileManager: New user profile successfully created.`);
                } else {
                    // --- Document ALREADY exists - User is logging in again or returning ---
                    transaction.update(userDocRef, {
                        lastLoginAt: serverTimestamp(),
                    });
                    console.log(`ProfileManager: Existing user profile last login time successfully updated.`);
                }
            });

            console.log("Profile Manager: User profile update completed.");
        } catch (firestoreError: any) {
            console.error("Profile Manager: Error creating/updating Firestore user profile:", firestoreError);
            userLogout(); // Calls the logout function to clear cookie session set during client login
            setProcessedUserId(null);
            if (clientAuth) {
                await clientAuth.signOut();
            }
            showToastError("Profile Manager: Error with user sign up or login. User features will be unavailable.");
        } finally {
            setProcessedUserId(user.uid);
        }
    };

    useEffect(() => {
        if (!loading && isFirebaseReady() && user?.uid && processedUserId !== user.uid) {
            processUserProfile(user);

        } else if (!loading && !user && processedUserId !== null) {
           setProcessedUserId(null);
        }
    }, [user, loading, processedUserId]); 

    return (
        <>
            <Toaster />
            {children}
        </>
    );
}
