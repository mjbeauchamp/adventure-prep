"use server";

import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase/adminApp';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 5; // 5 days in seconds

/*
 * NOTE: We're not currently using the session cookie created by this function, but if we do want 
 * to use it in the future for server-side access to Firestore, it's getting set correctly here and
 * cleaned up correctly with userLogout.ts elsewhere in the code.
 */
export async function handleServerLogin(idToken: any, initialUserData: any) {
    // Ensure the Admin SDK is initialized
    const adminAuth = await getAdminAuth();

    if (!adminAuth) {
        throw new Error("Firebase admin SDK not initialized. User services are not available.");
    }

    try {
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: COOKIE_MAX_AGE * 1000 });

        const expires = new Date(Date.now() + COOKIE_MAX_AGE * 1000);

        const cookieStore = await cookies();

        // Set the session cookie in the user's browser.
        // Once the session cookie is set, we can use it to authenticate requests on the server side.
        cookieStore.set('session', sessionCookie, {
            maxAge: COOKIE_MAX_AGE,
            expires: expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/', 
            sameSite: 'lax',
        });

    } catch (error) {
        console.error("Error in handleServerLogin:", error);
        const cookieStore = await cookies();
        cookieStore.set('session', '', { maxAge: 0, path: '/', httpOnly: true });

        throw new Error(`Login failed: ${error instanceof Error ? error.message : "An unknown error occurred."}`);
    }
}
