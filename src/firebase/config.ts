import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDLbiffMbrAG94ZhKuenT6zHizIJNTiiWg",
  authDomain: "blink-linknet.firebaseapp.com",
  projectId: "blink-linknet",
  storageBucket: "blink-linknet.firebasestorage.app",
  messagingSenderId: "92174087819",
  appId: "1:92174087819:web:fdf257e7a784f8fd86068e",
  measurementId: "G-7EHHGHRVY3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export default app;
