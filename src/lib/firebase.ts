import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB0Y1_QEWApjJisIa9p2QxdUq23VcyvnFI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-8244894270-d11c9.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-8244894270-d11c9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-8244894270-d11c9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "597243464907",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:597243464907:web:951b6fd7bd0f581f051f4e",
};

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };