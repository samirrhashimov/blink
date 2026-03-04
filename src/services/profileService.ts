import {
    doc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    setDoc,
    deleteDoc,
    limit
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { User, Container } from '../types';

export class ProfileService {
    /**
     * Get a user's full profile data by UID
     */
    static async getUserProfile(uid: string): Promise<User | null> {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return userDoc.data() as User;
            }
            return null;
        } catch (error) {
            console.error('[ProfileService] Error fetching user profile:', error);
            return null;
        }
    }

    /**
     * Get a user's profile by username (case-insensitive)
     */
    static async getUserByUsername(username: string): Promise<User | null> {
        try {
            const normalizedUsername = username.toLowerCase().replace(/^@/, '');
            const q = query(
                collection(db, 'users'),
                where('usernameLower', '==', normalizedUsername),
                limit(1)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                return snapshot.docs[0].data() as User;
            }
            return null;
        } catch (error) {
            console.error('[ProfileService] Error fetching user by username:', error);
            return null;
        }
    }

    /**
     * Check if a username is available
     */
    static async isUsernameAvailable(username: string, currentUid: string): Promise<boolean> {
        try {
            const normalizedUsername = username.toLowerCase().replace(/^@/, '');
            const q = query(
                collection(db, 'users'),
                where('usernameLower', '==', normalizedUsername),
                limit(1)
            );
            const snapshot = await getDocs(q);
            if (snapshot.empty) return true;
            // Allow if it's the same user
            return snapshot.docs[0].id === currentUid;
        } catch (error) {
            console.error('[ProfileService] Error checking username availability:', error);
            return false;
        }
    }

    /**
     * Update a user's profile photo (base64 string)
     */
    static async updateProfilePhoto(uid: string, base64Photo: string): Promise<void> {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            photoURL: base64Photo,
            updatedAt: new Date()
        });
    }

    /**
     * Update a user's username
     */
    static async updateUsername(uid: string, username: string): Promise<void> {
        const normalized = username.toLowerCase().replace(/^@/, '');
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            username: normalized,
            usernameLower: normalized,
            updatedAt: new Date()
        });
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Follow system — stored in a separate `follows` collection.
    // Each document ID = `{followerId}_{targetUid}`
    // Only the follower can create/delete their own follow document.
    // Firestore rule: allow write if request.auth.uid == resource.data.followerId
    // ────────────────────────────────────────────────────────────────────────────

    /** Follow a user */
    static async followUser(currentUid: string, targetUid: string): Promise<void> {
        const followId = `${currentUid}_${targetUid}`;
        const followRef = doc(db, 'follows', followId);
        await setDoc(followRef, {
            followerId: currentUid,
            followingId: targetUid,
            createdAt: new Date()
        });
    }

    /** Unfollow a user */
    static async unfollowUser(currentUid: string, targetUid: string): Promise<void> {
        const followId = `${currentUid}_${targetUid}`;
        await deleteDoc(doc(db, 'follows', followId));
    }

    /** Check if currentUid follows targetUid */
    static async isFollowing(currentUid: string, targetUid: string): Promise<boolean> {
        try {
            const followId = `${currentUid}_${targetUid}`;
            const snap = await getDoc(doc(db, 'follows', followId));
            return snap.exists();
        } catch {
            return false;
        }
    }

    /** Get follower count for a user */
    static async getFollowerCount(uid: string): Promise<number> {
        try {
            const q = query(collection(db, 'follows'), where('followingId', '==', uid));
            // Firestore requires compound indices for runAggregationQuery on certain collections
            // Let's use getDocs for now as this is a workaround for the 'permission-denied' on runAggregationQuery
            const snap = await getDocs(q);
            return snap.size;
        } catch {
            return 0;
        }
    }

    /** Get following count for a user */
    static async getFollowingCount(uid: string): Promise<number> {
        try {
            const q = query(collection(db, 'follows'), where('followerId', '==', uid));
            const snap = await getDocs(q);
            return snap.size;
        } catch {
            return 0;
        }
    }

    /** Get list of followers for a user */
    static async getFollowers(uid: string): Promise<User[]> {
        try {
            const q = query(collection(db, 'follows'), where('followingId', '==', uid));
            const snap = await getDocs(q);
            const userIds = snap.docs.map(doc => doc.data().followerId);

            if (userIds.length === 0) return [];

            const userPromises = userIds.map(id => getDoc(doc(db, 'users', id)));
            const docs = await Promise.all(userPromises);
            return docs.filter(d => d.exists()).map(d => d.data() as User);
        } catch (error) {
            console.error('[ProfileService] Error fetching followers:', error);
            return [];
        }
    }

    /** Get list of following for a user */
    static async getFollowing(uid: string): Promise<User[]> {
        try {
            const q = query(collection(db, 'follows'), where('followerId', '==', uid));
            const snap = await getDocs(q);
            const userIds = snap.docs.map(doc => doc.data().followingId);

            if (userIds.length === 0) return [];

            const userPromises = userIds.map(id => getDoc(doc(db, 'users', id)));
            const docs = await Promise.all(userPromises);
            return docs.filter(d => d.exists()).map(d => d.data() as User);
        } catch (error) {
            console.error('[ProfileService] Error fetching following:', error);
            return [];
        }
    }

    /**
     * Get public containers of a user
     */
    static async getPublicContainers(uid: string): Promise<Container[]> {
        try {
            const q = query(
                collection(db, 'vaults'),
                where('ownerId', '==', uid),
                where('isPublic', '==', true)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(docSnap => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                } as Container;
            });
        } catch (error) {
            console.error('[ProfileService] Error fetching public containers:', error);
            return [];
        }
    }

    /**
     * Convert a File to a base64 string (resized to max 256×256 for Firestore storage)
     */
    static async fileToBase64(file: File, maxSize: number = 256): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let { width, height } = img;

                    if (width > maxSize || height > maxSize) {
                        if (width > height) {
                            height = Math.round((height * maxSize) / width);
                            width = maxSize;
                        } else {
                            width = Math.round((width * maxSize) / height);
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d')!;
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.85));
                };
                img.onerror = reject;
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}
