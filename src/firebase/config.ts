import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // These will be replaced with actual Firebase project config
  apiKey: "AIzaSyDLbiffMbrAG94ZhKuenT6zHizIJNTiiWg",
  authDomain: "blink-linknet.firebaseapp.com",
  projectId: "blink-linknet",
  storageBucket: "blink-linknet.firebasestorage.app",
  messagingSenderId: "92174087819",
  appId: "1:92174087819:web:fdf257e7a784f8fd86068e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
