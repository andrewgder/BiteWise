// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  serverTimestamp,
  initializeFirestore,
} from "firebase/firestore";

// ↓ Replace with your web app config from Firebase console
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env
    .EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID as string,
};

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

// Firestore (web SDK works fine in Expo managed)
// If you see networking issues on emulators, you can swap to initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
export const db = getFirestore(app);
export const auth = getAuth(app);
export const now = () => serverTimestamp();
