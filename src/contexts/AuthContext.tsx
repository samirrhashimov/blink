import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  deleteUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  arrayRemove
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const createUserDocument = async (firebaseUser: FirebaseUser, displayName?: string) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    // Determine the display name to use
    const finalDisplayName = displayName || firebaseUser.displayName || 'Anonymous';

    if (!userSnap.exists()) {
      const userData: any = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: finalDisplayName,
        createdAt: new Date()
      };

      // Only add photoURL if it exists (not undefined)
      if (firebaseUser.photoURL) {
        userData.photoURL = firebaseUser.photoURL;
      }

      await setDoc(userRef, userData);
      return userData as User;
    }

    // If document exists, check if displayName needs to be updated
    const existingData = userSnap.data() as User;
    if (finalDisplayName !== 'Anonymous' && existingData.displayName !== finalDisplayName) {
      await updateDoc(userRef, {
        displayName: finalDisplayName
      });
      return { ...existingData, displayName: finalDisplayName } as User;
    }

    return existingData;
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await createUserDocument(result.user);
  };

  const signup = async (email: string, password: string, displayName: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    const userData = await createUserDocument(user, displayName);
    // Manually update currentUser state to ensure displayName is immediately available
    setCurrentUser(userData);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const deleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    const userId = user.uid;

    try {
      // 1. Delete user's vaults (owned vaults)
      const ownedVaultsQuery = query(
        collection(db, 'vaults'),
        where('ownerId', '==', userId)
      );
      const ownedVaultsSnapshot = await getDocs(ownedVaultsQuery);
      const deleteVaultPromises = ownedVaultsSnapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, 'vaults', docSnapshot.id))
      );
      await Promise.all(deleteVaultPromises);

      // 2. Remove user from shared vaults (authorizedUsers array)
      const sharedVaultsQuery = query(
        collection(db, 'vaults'),
        where('authorizedUsers', 'array-contains', userId)
      );
      const sharedVaultsSnapshot = await getDocs(sharedVaultsQuery);
      const updateVaultPromises = sharedVaultsSnapshot.docs.map(docSnapshot => 
        updateDoc(doc(db, 'vaults', docSnapshot.id), {
          authorizedUsers: arrayRemove(userId)
        })
      );
      await Promise.all(updateVaultPromises);

      // 3. Delete user's notifications
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      const deleteNotificationPromises = notificationsSnapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, 'notifications', docSnapshot.id))
      );
      await Promise.all(deleteNotificationPromises);

      // 4. Delete user's share invites (both sent and received)
      const sentInvitesQuery = query(
        collection(db, 'shareInvites'),
        where('invitedBy', '==', userId)
      );
      const sentInvitesSnapshot = await getDocs(sentInvitesQuery);
      const deleteSentInvitePromises = sentInvitesSnapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, 'shareInvites', docSnapshot.id))
      );

      // Also delete invites received by this user's email
      const userEmail = user.email?.toLowerCase();
      if (userEmail) {
        const receivedInvitesQuery = query(
          collection(db, 'shareInvites'),
          where('email', '==', userEmail)
        );
        const receivedInvitesSnapshot = await getDocs(receivedInvitesQuery);
        receivedInvitesSnapshot.docs.forEach(docSnapshot => {
          deleteSentInvitePromises.push(deleteDoc(doc(db, 'shareInvites', docSnapshot.id)));
        });
      }
      await Promise.all(deleteSentInvitePromises);

      // 5. Delete user's vault permissions
      const permissionsQuery = query(
        collection(db, 'vaultPermissions'),
        where('userId', '==', userId)
      );
      const permissionsSnapshot = await getDocs(permissionsQuery);
      const deletePermissionPromises = permissionsSnapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, 'vaultPermissions', docSnapshot.id))
      );
      await Promise.all(deletePermissionPromises);

      // 6. Delete user's share links
      const shareLinksQuery = query(
        collection(db, 'shareLinks'),
        where('createdBy', '==', userId)
      );
      const shareLinksSnapshot = await getDocs(shareLinksQuery);
      const deleteShareLinkPromises = shareLinksSnapshot.docs.map(docSnapshot => 
        deleteDoc(doc(db, 'shareLinks', docSnapshot.id))
      );
      await Promise.all(deleteShareLinkPromises);

      // 7. Delete user document from Firestore
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);

      // 8. Delete user from Firebase Auth (this must be last)
      await deleteUser(user);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      throw new Error(`Failed to delete account: ${error.message}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await createUserDocument(firebaseUser);
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    loginWithGoogle,
    signup,
    logout,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
