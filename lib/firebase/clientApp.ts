// CLIENT FIREBASE SETUP
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore'; 

const firebaseConfig = {
  apiKey: "AIzaSyAXT9BiQhgiE6-kvg3jlSVZ0TEVlW4nVh8",
  authDomain: "adventureprep-318f1.firebaseapp.com",
  projectId: "adventureprep-318f1",
  storageBucket: "adventureprep-318f1.firebasestorage.app",
  messagingSenderId: "681679030712",
  appId: "1:681679030712:web:417517f90ea5106efce74d",
  measurementId: "G-52X8Z3E9K3"
};

// Initialize Firebase
function getClientApp() {
  try {
    if (getApps().length) {
      return getApp();
    }
    return initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Error initializing Firebase client app:", error);
    throw new Error("Failed to initialize Firebase client app");
  }
}

let clientApp: ReturnType<typeof initializeApp>;
let clientAuth: Auth;
let clientDatabase;

try {
  clientApp = getClientApp();
  clientAuth = getAuth(clientApp);
  clientDatabase = getFirestore(clientApp);
} catch (error) {
  console.error("Error setting up Firebase client auth services:", error);
  throw new Error("Critical: Firebase client initialization failed. App cannot continue.");
}

export { clientApp, clientAuth, clientDatabase };