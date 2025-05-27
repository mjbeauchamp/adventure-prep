'use server';
// SERVER FIREBASE SETUP FOR ADMIN FEATURES
// This file initializes the Firebase Admin SDK for server-side operations
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth'; 

const serviceAccountKey = process.env.PRIVATE_FIREBASE_SERVICE_ACCOUNT_KEY;

let serviceAccount: string | undefined;

try {
  serviceAccount = serviceAccountKey ? JSON.parse(serviceAccountKey) : '';
} catch (error) {
  console.error("Failed to parse Firebase service account key:", error);
  throw new Error("Failed to parse Firebase service account key");
}



function getAdminApp() {
  // If adminApp already initialized, return it
  if (getApps().length) {
    return getApp();
  }

  if (!serviceAccount) {
      console.error("Firebase Admin SDK credentials not available. Admin features will not work.");
      throw new Error("Firebase Admin SDK credentials not available. User features will not be available.");
  }

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: "adventureprep-318f1",
  });
}

export async function getAdminAuth() {
  const adminApp = getAdminApp();
  const adminAuth = adminApp ? getAuth(adminApp) : null;
  return adminAuth;
}
