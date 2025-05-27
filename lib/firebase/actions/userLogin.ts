"use server";

import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase/adminApp';
import { getAuthenticatedFirestore } from '@/lib/firebase/serverApp';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 5; // 5 days in seconds

/*
 * Handles the server-side part of user login after successful client-side sign-in.
 * Updates session cookies and creates or updates the user's profile in Firestore.
 */
export async function handleServerLogin(idToken: any, initialUserData: any) {
    // Ensure the Admin SDK is initialized
    const adminAuth = await getAdminAuth();

    if (!adminAuth) {
        throw new Error("Firebase admin SDK not initialized. User services are not available.");
    }

    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);

        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: COOKIE_MAX_AGE * 1000 });

        const expires = new Date(Date.now() + COOKIE_MAX_AGE * 1000);

        const cookieStore = await cookies();

        // Set the session cookie in the user's browser.
        // Once the session cookie is set, subsequent calls to getAuthenticatedFirestore()
        // from Server Components/Actions in this request context will be authenticated
        // as the user identified by the session cookie.
        cookieStore.set('session', sessionCookie, {
            maxAge: COOKIE_MAX_AGE,
            expires: expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/', 
            sameSite: 'lax',
        });

        try {
            const db = await getAuthenticatedFirestore();
            const userId = decodedToken.uid;

            if (!userId) {
                throw new Error("User ID not found in decoded Firebase token.");
            }

            const userDocRef = doc(db, 'users', userId);

            // Check if the user document already exists
            const userDocSnapshot = await getDoc(userDocRef);

            if (!userDocSnapshot.exists()) {
                console.log(`User document does not exist for UID: ${userId}. Creating...`);

                try {
                    await setDoc(userDocRef, {
                        uid: userId,
                        email: initialUserData.email || null,
                        displayName: initialUserData.displayName || null,
                        photoURL: initialUserData.photoURL || null,
                        createdAt: new Date(),
                        lastLoginAt: new Date()
                    }, { merge: false });
                    console.log(`New user profile successfully created for user: ${initialUserData.displayName || initialUserData.email}`);
                } catch (error) {
                    console.error("Failed to create new user profile in Firestore:", error);
                    const cookieStore = await cookies();
                    cookieStore.delete('session');
                    return { error: "Failed to create new user profile." };
                }
            } else {
                console.log(`User document exists for UID: ${userId}. Updating last login time...`);
                try {
                    await updateDoc(userDocRef, {
                        lastLoginAt: new Date(),
                    });
                    console.log(`User profile updated with last login time for user: ${initialUserData.displayName || initialUserData.email}`);
                } catch (error) {
                    console.error("Failed to update last login time in Firestore:", error);
                }
            }
        } catch (firestoreError) {
            console.error("Initial client login successful, but failed to create user profile in database.", firestoreError);
            const cookieStore = await cookies();
            cookieStore.delete('session');
            return { error: "Initial client login successful, but failed to create user profile." };
        }

    } catch (error) {
        console.error("Error in handleServerLogin:", error);
        const cookieStore = await cookies();
        cookieStore.delete('session');

        throw new Error(`Login failed: ${error instanceof Error ? error.message : "An unknown error occurred."}`);
    }
}
