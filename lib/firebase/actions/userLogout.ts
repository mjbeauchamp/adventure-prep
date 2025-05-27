"use server"

import { cookies } from 'next/headers';

// This function completes the logout process on the server side by deleting the session cookie.
export async function userLogout() {
    const cookieStore = await cookies();

    cookieStore.set('session', '', { maxAge: 0, path: '/', httpOnly: true });
    console.log("Session cookie deleted. User logged out successfully.");
}

