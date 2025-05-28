'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthorizationProvider';
import { userLogout } from '@/lib/firebase/actions/userLogout';
import toast, { Toaster } from 'react-hot-toast';
import { clientAuth, clientDatabase } from '@/lib/firebase/clientApp';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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

    useEffect(() => {
        if (!loading && user && user !== null && processedUserId !== user.uid) {
            console.log('USER', user)
            const processUserProfile = async () => {
                try {
                    const userId = user.uid;
                    const userDocRef = doc(clientDatabase, 'users', userId);
                    const userDocSnapshot = await getDoc(userDocRef);

                    if (!userDocSnapshot.exists()) {
                        // Document does NOT exist, add new user
                        try {
                            await setDoc(userDocRef, {
                                uid: userId,
                                email: user.email || null,
                                displayName: user.displayName || null,
                                photoURL: user.photoURL || null,
                                createdAt: serverTimestamp(),
                                lastLoginAt: serverTimestamp(), 
                            }, { merge: false });

                            console.log(`ProfileManager: New user profile successfully created.`);
                        } catch (error) {
                            console.error("Failed to create new user profile in Firestore:", error);
                            userLogout(); // Calls the logout function to clear cookie session set during client login
                            await clientAuth.signOut();
                            showToastError("Failed to create new user profile. User features will be unavailable.");
                        }

                    } else {
                        // --- Document ALREADY exists - User is logging in again or returning ---
                        try {
                            await updateDoc(userDocRef, {
                                lastLoginAt: serverTimestamp(),
                            });
                            console.log(`ProfileManager: Existing user profile last login time successfully updated.`);
                        } catch (error) {
                            console.error("Failed to update last login time in Firestore:", error);
                            userLogout(); // Calls the logout function to clear cookie session set during client login
                            await clientAuth.signOut();
                            showToastError("Failed to update user profile login time. User features are unavailable.");
                        }
                    }
                } catch (firestoreError: any) {
                    console.error("ProfileManager: Error creating/updating Firestore user profile:", firestoreError);
                    userLogout(); // Calls the logout function to clear cookie session set during client login
                    await clientAuth.signOut();
                    showToastError("ProfileManager: Error creating/updating Firestore user profile. User features will be unavailable.");
                } finally {
                    setProcessedUserId(user.uid);
                }
            };

            processUserProfile();

        } else if (!loading && !user && processedUserId !== null) {
           setProcessedUserId(null);
        }
    }, [user, loading, processedUserId, clientDatabase]); 

    return (
        <>
            <Toaster />
            {children}
        </>
    );
}
