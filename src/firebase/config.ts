import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDLbiffMbrAG94ZhKuenT6zHizIJNTiiWg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "blink-linknet.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "blink-linknet",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "blink-linknet.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "92174087819",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:92174087819:web:fdf257e7a784f8fd86068e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7EHHGHRVY3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export default app;

