import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const SHARE_LINKS_COLLECTION = 'shareLinks';

export interface ShareLink {
  id: string;
  containerId: string;
  token: string;
  permission: 'view' | 'comment' | 'edit';
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
}

export class ShareLinkService {
  // Generate a random token
  private static generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Create a share link
  static async createShareLink(
    containerId: string,
    createdBy: string,
    permission: 'view' | 'comment' | 'edit',
    expiresInDays?: number,
    maxUses?: number
  ): Promise<ShareLink> {
    try {
      const token = this.generateToken();
      
      let expiresAt;
      if (expiresInDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      }

      const shareLinkData = {
        containerId,
        token,
        permission,
        createdBy,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt || null,
        maxUses: maxUses || null,
        currentUses: 0,
        isActive: true
      };

      const docRef = await addDoc(collection(db, SHARE_LINKS_COLLECTION), shareLinkData);
      
      return {
        id: docRef.id,
        ...shareLinkData,
        createdAt: new Date(),
        expiresAt
      } as ShareLink;
    } catch (error) {
      console.error('Error creating share link:', error);
      throw new Error('Failed to create share link');
    }
  }

  // Get share link by token
  static async getShareLinkByToken(token: string): Promise<ShareLink | null> {
    try {
      const q = query(
        collection(db, SHARE_LINKS_COLLECTION),
        where('token', '==', token),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      const shareLink: ShareLink = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : data.expiresAt
      } as ShareLink;

      // Check if expired
      if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
        return null;
      }

      // Check if max uses reached
      if (shareLink.maxUses && shareLink.currentUses >= shareLink.maxUses) {
        return null;
      }

      return shareLink;
    } catch (error) {
      console.error('Error getting share link:', error);
      return null;
    }
  }

  // Use a share link (increment usage count)
  static async useShareLink(shareLinkId: string): Promise<void> {
    try {
      const docRef = doc(db, SHARE_LINKS_COLLECTION, shareLinkId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        await updateDoc(docRef, {
          currentUses: (data.currentUses || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error using share link:', error);
      throw new Error('Failed to use share link');
    }
  }

  // Get all share links for a container
  static async getContainerShareLinks(containerId: string): Promise<ShareLink[]> {
    try {
      const q = query(
        collection(db, SHARE_LINKS_COLLECTION),
        where('containerId', '==', containerId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const shareLinks: ShareLink[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        shareLinks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : data.expiresAt
        } as ShareLink);
      });

      return shareLinks;
    } catch (error) {
      console.error('Error fetching share links:', error);
      throw new Error('Failed to fetch share links');
    }
  }

  // Deactivate a share link
  static async deactivateShareLink(shareLinkId: string): Promise<void> {
    try {
      const docRef = doc(db, SHARE_LINKS_COLLECTION, shareLinkId);
      await updateDoc(docRef, {
        isActive: false
      });
    } catch (error) {
      console.error('Error deactivating share link:', error);
      throw new Error('Failed to deactivate share link');
    }
  }

  // Generate full share URL
  static generateShareUrl(token: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/${token}`;
  }
}
