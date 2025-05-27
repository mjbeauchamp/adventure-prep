// SERVER FIREBASE SETUP
'use server';

import { initializeServerApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; 
import { getAuth } from 'firebase/auth'; 
import { cookies } from 'next/headers';

const firebaseConfig = {
  apiKey: "AIzaSyAXT9BiQhgiE6-kvg3jlSVZ0TEVlW4nVh8",
  authDomain: "adventureprep-318f1.firebaseapp.com",
  projectId: "adventureprep-318f1",
  storageBucket: "adventureprep-318f1.firebasestorage.app",
  messagingSenderId: "681679030712",
  appId: "1:681679030712:web:417517f90ea5106efce74d",
  measurementId: "G-52X8Z3E9K3"
};

async function getAuthenticatedAppForUser() {
    try {
        const cookieResults = await cookies();

        const idToken = cookieResults.get('session')?.value

        const serverApp = initializeServerApp(
            firebaseConfig,
            {
            authIdToken: idToken,
            }
        );

        return serverApp;
    } catch (error) {
        console.error("Error initializing authenticated Firebase app:", error);
        throw new Error("Failed to initialize authenticated Firebase app");
    }
  
}

export async function getAuthenticatedFirestore() {
  try {
    const serverApp = await getAuthenticatedAppForUser();
    return getFirestore(serverApp);
  } catch (error) {
    console.error("Error getting authenticated Firestore instance:", error);
    throw new Error("Failed to get authenticated Firestore instance");
  }
}

export async function getAuthenticatedAuth() {
  try {
    const serverApp = await getAuthenticatedAppForUser();
    return getAuth(serverApp);
  } catch (error) {
    console.error("Error getting authenticated Auth instance:", error);
    throw new Error("Failed to get authenticated Auth instance");
  }
}
