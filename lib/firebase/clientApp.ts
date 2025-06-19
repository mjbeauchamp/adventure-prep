// CLIENT FIREBASE SETUP
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from 'firebase/firestore'; 

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
};

function validateEnvVar(value: string | undefined, name: string): string | null {
  if (!value) {
    console.warn(`Missing environment variable: ${name}`);
    return null; 
  }
  return value;
}

console.log()

const firebaseConfigValues = {
  apiKey: validateEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY, "NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: validateEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: validateEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, "NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: validateEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: validateEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: validateEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, "NEXT_PUBLIC_FIREBASE_APP_ID"),
  measurementId: validateEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"),
};

const isFirebaseConfigComplete = Object.values(firebaseConfigValues).every(val => typeof val === 'string');

const firebaseConfig: FirebaseConfig | null = isFirebaseConfigComplete
  ? (firebaseConfigValues as FirebaseConfig)
  : null;

// Initialize Firebase
function getClientApp() {
  if (!isFirebaseConfigComplete) {
    return null;
  } else {
    try {
      if (getApps().length) {
        return getApp();
      }
      return initializeApp(firebaseConfig as Record<string, string>);
    } catch (error) {
      console.error("Error initializing Firebase client app:", error);
      return null;
    }
  }
}

let clientApp: ReturnType<typeof initializeApp> | null = null;
let clientAuth: Auth | null = null;
let clientDatabase: Firestore | null = null;

try {
  if (isFirebaseConfigComplete) {
    clientApp = getClientApp();
    if (clientApp !== null) {
      clientAuth = getAuth(clientApp);
      clientDatabase = getFirestore(clientApp);
    }
  }
  
} catch (error) {
  console.error("Error setting up Firebase client auth services:", error);
}

function isFirebaseReady() {
  return clientApp !== null && clientAuth !== null && clientDatabase !== null;
}

export { clientApp, clientAuth, clientDatabase, isFirebaseReady };