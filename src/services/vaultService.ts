import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Vault, Link } from '../types';

const VAULTS_COLLECTION = 'vaults';

export class VaultService {
  // Create a new vault
  static async createVault(vaultData: Omit<Vault, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, VAULTS_COLLECTION), {
        ...vaultData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating vault:', error);
      throw new Error('Failed to create vault');
    }
  }

  // Get all vaults for a user (owned or shared)
  static async getUserVaults(userId: string): Promise<Vault[]> {
    try {
      const q = query(
        collection(db, VAULTS_COLLECTION),
        where('ownerId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const vaults: Vault[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        vaults.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Vault);
      });

      // Also get shared vaults
      const sharedQ = query(
        collection(db, VAULTS_COLLECTION),
        where('authorizedUsers', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      const sharedSnapshot = await getDocs(sharedQ);
      sharedSnapshot.forEach((doc) => {
        const data = doc.data();
        // Skip if the current user is the owner (already fetched above)
        if (data.ownerId === userId) return;

        vaults.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          isShared: true
        } as Vault);
      });

      return vaults;
    } catch (error) {
      console.error('Error fetching user vaults:', error);
      throw new Error('Failed to fetch vaults');
    }
  }

  // Get a specific vault by ID
  static async getVault(vaultId: string): Promise<Vault | null> {
    try {
      const docRef = doc(db, VAULTS_COLLECTION, vaultId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Vault;
      }
      return null;
    } catch (error) {
      console.error('Error fetching vault:', error);
      throw new Error('Failed to fetch vault');
    }
  }

  // Update a vault
  static async updateVault(vaultId: string, updates: Partial<Vault>): Promise<void> {
    try {
      const docRef = doc(db, VAULTS_COLLECTION, vaultId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating vault:', error);
      throw new Error('Failed to update vault');
    }
  }

  // Delete a vault
  static async deleteVault(vaultId: string): Promise<void> {
    try {
      const docRef = doc(db, VAULTS_COLLECTION, vaultId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting vault:', error);
      throw new Error('Failed to delete vault');
    }
  }

  // Add a link to a vault
  static async addLinkToVault(vaultId: string, link: Omit<Link, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const vaultRef = doc(db, VAULTS_COLLECTION, vaultId);
      const vaultSnap = await getDoc(vaultRef);

      if (vaultSnap.exists()) {
        const vaultData = vaultSnap.data();
        const currentLinks = vaultData.links || [];

        const newLink: Link = {
          id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...link,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await updateDoc(vaultRef, {
          links: [...currentLinks, newLink],
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error adding link to vault:', error);
      throw new Error('Failed to add link to vault');
    }
  }

  // Update a link in a vault
  static async updateLinkInVault(vaultId: string, linkId: string, updates: Partial<Link>): Promise<void> {
    try {
      const vaultRef = doc(db, VAULTS_COLLECTION, vaultId);
      const vaultSnap = await getDoc(vaultRef);

      if (vaultSnap.exists()) {
        const vaultData = vaultSnap.data();
        const links = vaultData.links || [];

        const updatedLinks = links.map((link: Link) =>
          link.id === linkId
            ? { ...link, ...updates, updatedAt: new Date() }
            : link
        );

        await updateDoc(vaultRef, {
          links: updatedLinks,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating link in vault:', error);
      throw new Error('Failed to update link');
    }
  }

  // Track a link click
  static async trackLinkClick(vaultId: string, linkId: string): Promise<void> {
    try {
      const vaultRef = doc(db, VAULTS_COLLECTION, vaultId);
      const vaultSnap = await getDoc(vaultRef);

      if (vaultSnap.exists()) {
        const vaultData = vaultSnap.data();
        const links = vaultData.links || [];
        const today = new Date().toISOString().split('T')[0];

        const updatedLinks = links.map((link: Link) => {
          if (link.id === linkId) {
            const currentStats = link.clickStats || {};
            return {
              ...link,
              clicks: (link.clicks || 0) + 1,
              clickStats: {
                ...currentStats,
                [today]: (currentStats[today] || 0) + 1
              },
              updatedAt: new Date()
            };
          }
          return link;
        });

        await updateDoc(vaultRef, {
          links: updatedLinks,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error tracking link click:', error);
      // We don't throw here to avoid interrupting the user's navigation
    }
  }

  // Delete a link from a vault
  static async deleteLinkFromVault(vaultId: string, linkId: string): Promise<void> {
    try {
      const vaultRef = doc(db, VAULTS_COLLECTION, vaultId);
      const vaultSnap = await getDoc(vaultRef);

      if (vaultSnap.exists()) {
        const vaultData = vaultSnap.data();
        const links = vaultData.links || [];

        const updatedLinks = links.filter((link: Link) => link.id !== linkId);

        await updateDoc(vaultRef, {
          links: updatedLinks,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error deleting link from vault:', error);
      throw new Error('Failed to delete link');
    }
  }

  // Share a vault with a user
  static async shareVault(vaultId: string, userId: string, _permission: 'view' | 'comment' | 'edit'): Promise<void> {
    try {
      const vaultRef = doc(db, VAULTS_COLLECTION, vaultId);
      const vaultSnap = await getDoc(vaultRef);

      if (vaultSnap.exists()) {
        const vaultData = vaultSnap.data();
        const authorizedUsers = vaultData.authorizedUsers || [];

        if (!authorizedUsers.includes(userId)) {
          await updateDoc(vaultRef, {
            authorizedUsers: [...authorizedUsers, userId],
            updatedAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Error sharing vault:', error);
      throw new Error('Failed to share vault');
    }
  }

  // Reorder links in a vault
  static async reorderLinks(vaultId: string, links: Link[]): Promise<void> {
    try {
      const vaultRef = doc(db, VAULTS_COLLECTION, vaultId);
      await updateDoc(vaultRef, {
        links: links,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error reordering links:', error);
      throw new Error('Failed to reorder links');
    }
  }

  // Move a link from one vault to another
  static async moveLinkToVault(sourceVaultId: string, targetVaultId: string, linkId: string): Promise<void> {
    try {
      const sourceRef = doc(db, VAULTS_COLLECTION, sourceVaultId);
      const targetRef = doc(db, VAULTS_COLLECTION, targetVaultId);

      const [sourceSnap, targetSnap] = await Promise.all([
        getDoc(sourceRef),
        getDoc(targetRef)
      ]);

      if (sourceSnap.exists() && targetSnap.exists()) {
        const sourceLinks = sourceSnap.data().links || [];
        const targetLinks = targetSnap.data().links || [];

        const linkToMove = sourceLinks.find((l: Link) => l.id === linkId);
        if (!linkToMove) throw new Error('Link not found in source vault');

        const updatedSourceLinks = sourceLinks.filter((l: Link) => l.id !== linkId);
        const updatedTargetLinks = [...targetLinks, { ...linkToMove, updatedAt: new Date() }];

        // Use a transaction for safety? Or just two updates. 
        // For simplicity, two updates, but a transaction is better.
        await updateDoc(sourceRef, {
          links: updatedSourceLinks,
          updatedAt: serverTimestamp()
        });
        await updateDoc(targetRef, {
          links: updatedTargetLinks,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error moving link between vaults:', error);
      throw new Error('Failed to move link');
    }
  }

  // Real-time listener for vault changes
  static subscribeToVault(vaultId: string, callback: (vault: Vault | null) => void): () => void {
    const docRef = doc(db, VAULTS_COLLECTION, vaultId);

    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const vault: Vault = {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Vault;
        callback(vault);
      } else {
        callback(null);
      }
    });
  }
}

