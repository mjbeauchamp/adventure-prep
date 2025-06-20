'use client';

import { useEffect, useState } from 'react';
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
    // processedUserId tracks if the profile processing has already been completed for initial login.
    // This prevents re-processing on re-renders or token refreshes for the same user.
    const [processedUserId, setProcessedUserId] = useState<string | null>(null);
    const [processedUserDisplayName, setProcessedUserDisplayName] = useState<string | null>(null);

    const processUserProfile = async (user: User) => {
        try {
            if (clientDatabase === null ) {
                console.error("Profile Manager: Error creating/updating Firestore user profile");
                setProcessedUserId(null);
                setProcessedUserDisplayName(null)
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
            setProcessedUserId(null);
            setProcessedUserDisplayName(null)
            if (clientAuth) {
                await clientAuth.signOut();
            }
            showToastError("Profile Manager: Error with user sign up or login. User features will be unavailable.");
        } finally {
            setProcessedUserId(user.uid);
            setProcessedUserDisplayName(user.displayName);
        }
    };

    useEffect(() => {
        if (!loading && isFirebaseReady() && user?.uid && (processedUserId !== user.uid || processedUserDisplayName !== displayName)) {
           console.log('Running processUserProfile AGAIN')
            processUserProfile(user);

        } else if (!loading && !user && processedUserId !== null) {
           setProcessedUserId(null);
           setProcessedUserDisplayName(null);
        }
    }, [user, loading, processedUserId, processedUserDisplayName, displayName]); 

    return (
        <>
            <Toaster />
            {children}
        </>
    );
}
