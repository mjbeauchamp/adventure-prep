'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthorizationProvider';
import toast, { Toaster } from 'react-hot-toast';
import { clientAuth, clientDatabase, isFirebaseReady } from '@/lib/firebase/clientApp';
import { doc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface ProfileManagerProps {
    children: React.ReactNode;
}

export default function ProfileManager({ children }: ProfileManagerProps) {
    const showToastError = (message: string) => toast(message, {
        className: 'toast-error',
    });
    const { user, loading, displayName } = useAuth();
    // previousUserState tracks if the profile processing has already been completed for initial login or user updates.
    // This prevents re-processing on re-renders or token refreshes for the same user.
    const previousUserState = useRef<{ uid: string | null, displayName: string | null }>({
        uid: null,
        displayName: null,
    });

    const processUserProfile = async (user: User) => {
        try {
            if (clientDatabase === null ) {
                console.error("Profile Manager: Error creating/updating Firestore user profile");
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
                    const currentData = userDoc.data();
                    const updates: Record<string, any> = {
                    lastLoginAt: serverTimestamp(),
                    };

                    if (user.displayName && user.displayName !== currentData.displayName) {
                        updates.displayName = user.displayName;
                        console.log(`ProfileManager: Updating displayName to "${user.displayName}"`);
                    }
                                    
                    transaction.update(userDocRef, updates);
                    console.log(`ProfileManager: Existing user profile last login time successfully updated.`);
                }
            });

            console.log("Profile Manager: User profile update completed.");
        } catch (firestoreError: any) {
            console.error("Profile Manager: Error creating/updating Firestore user profile:", firestoreError);
            if (clientAuth) {
                await clientAuth.signOut();
            }
            showToastError("Profile Manager: Error with user sign up or login. User features will be unavailable.");
        }
    };

    useEffect(() => {
        if (!loading && isFirebaseReady() && user?.uid && (user.uid !== previousUserState.current.uid ||
            user.displayName !== previousUserState.current.displayName)) {
            processUserProfile(user);
            previousUserState.current = { uid: user.uid, displayName: user.displayName || null };

        } else if (!loading && !user && previousUserState.current.uid !== null) {
            previousUserState.current = { uid: null, displayName: null };
        }
    }, [user, loading, displayName]); 

    return (
        <>
            <Toaster />
            {children}
        </>
    );
}
