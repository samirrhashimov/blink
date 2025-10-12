import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    console.log('Auth instance:', auth);
    console.log('Firestore instance:', db);
    
    // Test creating a user (this will fail if auth is not enabled)
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    console.log('Attempting to create test user...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ User created successfully:', userCredential.user.uid);
    
    // Test Firestore write
    console.log('Testing Firestore write...');
    await setDoc(doc(db, 'test', 'connection'), {
      timestamp: new Date(),
      message: 'Firebase connection test successful',
      testId: `test-${Date.now()}`
    });
    console.log('✅ Firestore write successful');
    
    // Clean up test user
    await userCredential.user.delete();
    console.log('✅ Test user cleaned up');
    
    return { success: true, message: 'Firebase connection working perfectly!' };
  } catch (error: any) {
    console.error('❌ Firebase connection test failed:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      details: error
    };
  }
};
