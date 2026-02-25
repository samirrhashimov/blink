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
import type { Container, Link } from '../types';

const CONTAINERS_COLLECTION = 'vaults';

export class ContainerService {
  // Create a new container
  static async createContainer(containerData: Omit<Container, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, CONTAINERS_COLLECTION), {
        ...containerData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating container:', error);
      throw new Error('Failed to create container');
    }
  }

  // Get all containers for a user (owned or shared)
  static async getUserContainers(userId: string): Promise<Container[]> {
    try {
      const q = query(
        collection(db, CONTAINERS_COLLECTION),
        where('ownerId', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const containers: Container[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        containers.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Container);
      });

      // Also get shared containers
      const sharedQ = query(
        collection(db, CONTAINERS_COLLECTION),
        where('authorizedUsers', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      const sharedSnapshot = await getDocs(sharedQ);
      sharedSnapshot.forEach((doc) => {
        const data = doc.data();
        // Skip if the current user is the owner (already fetched above)
        if (data.ownerId === userId) return;

        containers.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          isShared: true
        } as Container);
      });

      return containers;
    } catch (error) {
      console.error('Error fetching user containers:', error);
      throw new Error('Failed to fetch containers');
    }
  }

  // Get a specific container by ID
  static async getContainer(containerId: string): Promise<Container | null> {
    try {
      const docRef = doc(db, CONTAINERS_COLLECTION, containerId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Container;
      }
      return null;
    } catch (error) {
      console.error('Error fetching container:', error);
      throw new Error('Failed to fetch container');
    }
  }

  // Update a container
  static async updateContainer(containerId: string, updates: Partial<Container>): Promise<void> {
    try {
      const docRef = doc(db, CONTAINERS_COLLECTION, containerId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating container:', error);
      throw new Error('Failed to update container');
    }
  }

  // Delete a container
  static async deleteContainer(containerId: string): Promise<void> {
    try {
      const docRef = doc(db, CONTAINERS_COLLECTION, containerId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting container:', error);
      throw new Error('Failed to delete container');
    }
  }

  // Add a link to a container
  static async addLinkToContainer(containerId: string, link: Omit<Link, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const containerRef = doc(db, CONTAINERS_COLLECTION, containerId);
      const containerSnap = await getDoc(containerRef);

      if (containerSnap.exists()) {
        const containerData = containerSnap.data();
        const currentLinks = containerData.links || [];

        const linkId = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Clean link data to remove undefined values (Firebase doesn't allow undefined)
        // We use JSON parse/stringify as a safe way to remove undefined fields from the input object
        // The input 'link' only contains strings, arrays, and possibly undefined, so this is safe.
        const cleanLinkData = JSON.parse(JSON.stringify(link));

        const newLink: Link = {
          id: linkId,
          ...cleanLinkData,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await updateDoc(containerRef, {
          links: [...currentLinks, newLink],
          updatedAt: serverTimestamp()
        });

        return linkId;
      }
      throw new Error('Container not found');
    } catch (error) {
      console.error('Error adding link to container:', error);
      throw new Error('Failed to add link to container');
    }
  }

  // Update a link in a container
  static async updateLinkInContainer(containerId: string, linkId: string, updates: Partial<Link>): Promise<void> {
    try {
      const containerRef = doc(db, CONTAINERS_COLLECTION, containerId);
      const containerSnap = await getDoc(containerRef);

      if (containerSnap.exists()) {
        const containerData = containerSnap.data();
        const links = containerData.links || [];

        const updatedLinks = links.map((link: Link) =>
          link.id === linkId
            ? { ...link, ...updates, updatedAt: new Date() }
            : link
        );

        await updateDoc(containerRef, {
          links: updatedLinks,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating link in container:', error);
      throw new Error('Failed to update link');
    }
  }

  // Track a link click
  static async trackLinkClick(containerId: string, linkId: string): Promise<void> {
    try {
      const containerRef = doc(db, CONTAINERS_COLLECTION, containerId);
      const containerSnap = await getDoc(containerRef);

      if (containerSnap.exists()) {
        const containerData = containerSnap.data();
        const links = containerData.links || [];
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

        await updateDoc(containerRef, {
          links: updatedLinks,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error tracking link click:', error);
      // We don't throw here to avoid interrupting the user's navigation
    }
  }

  // Delete a link from a container
  static async deleteLinkFromContainer(containerId: string, linkId: string): Promise<void> {
    try {
      const containerRef = doc(db, CONTAINERS_COLLECTION, containerId);
      const containerSnap = await getDoc(containerRef);

      if (containerSnap.exists()) {
        const containerData = containerSnap.data();
        const links = containerData.links || [];

        const updatedLinks = links.filter((link: Link) => link.id !== linkId);

        await updateDoc(containerRef, {
          links: updatedLinks,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error deleting link from container:', error);
      throw new Error('Failed to delete link');
    }
  }

  // Share a container with a user
  static async shareContainer(containerId: string, userId: string, _permission: 'view' | 'comment' | 'edit'): Promise<void> {
    try {
      const containerRef = doc(db, CONTAINERS_COLLECTION, containerId);
      const containerSnap = await getDoc(containerRef);

      if (containerSnap.exists()) {
        const containerData = containerSnap.data();
        const authorizedUsers = containerData.authorizedUsers || [];

        if (!authorizedUsers.includes(userId)) {
          await updateDoc(containerRef, {
            authorizedUsers: [...authorizedUsers, userId],
            updatedAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Error sharing container:', error);
      throw new Error('Failed to share container');
    }
  }

  // Reorder links in a container
  static async reorderLinks(containerId: string, links: Link[]): Promise<void> {
    try {
      const containerRef = doc(db, CONTAINERS_COLLECTION, containerId);
      await updateDoc(containerRef, {
        links: links,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error reordering links:', error);
      throw new Error('Failed to reorder links');
    }
  }

  // Move a link from one container to another
  static async moveLinkToContainer(sourceContainerId: string, targetContainerId: string, linkId: string): Promise<void> {
    try {
      const sourceRef = doc(db, CONTAINERS_COLLECTION, sourceContainerId);
      const targetRef = doc(db, CONTAINERS_COLLECTION, targetContainerId);

      const [sourceSnap, targetSnap] = await Promise.all([
        getDoc(sourceRef),
        getDoc(targetRef)
      ]);

      if (sourceSnap.exists() && targetSnap.exists()) {
        const sourceLinks = sourceSnap.data().links || [];
        const targetLinks = targetSnap.data().links || [];

        const linkToMove = sourceLinks.find((l: Link) => l.id === linkId);
        if (!linkToMove) throw new Error('Link not found in source container');

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
      console.error('Error moving link between containers:', error);
      throw new Error('Failed to move link');
    }
  }
  // Move multiple links from one container to another
  static async moveLinksToContainer(sourceContainerId: string, targetContainerId: string, linkIds: string[]): Promise<void> {
    try {
      const sourceRef = doc(db, CONTAINERS_COLLECTION, sourceContainerId);
      const targetRef = doc(db, CONTAINERS_COLLECTION, targetContainerId);

      const [sourceSnap, targetSnap] = await Promise.all([
        getDoc(sourceRef),
        getDoc(targetRef)
      ]);

      if (sourceSnap.exists() && targetSnap.exists()) {
        const sourceLinks = sourceSnap.data().links || [];
        const targetLinks = targetSnap.data().links || [];

        const linksToMove = sourceLinks.filter((l: Link) => linkIds.includes(l.id));
        if (linksToMove.length === 0) throw new Error('No valid links found to move');

        const updatedSourceLinks = sourceLinks.filter((l: Link) => !linkIds.includes(l.id));
        const updatedTargetLinks = [...targetLinks, ...linksToMove.map((l: Link) => ({ ...l, updatedAt: new Date() }))];

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
      console.error('Error moving links between containers:', error);
      throw new Error('Failed to move links');
    }
  }

  // Delete multiple links from a container
  static async deleteLinksFromContainer(containerId: string, linkIds: string[]): Promise<void> {
    try {
      const containerRef = doc(db, CONTAINERS_COLLECTION, containerId);
      const containerSnap = await getDoc(containerRef);

      if (containerSnap.exists()) {
        const containerData = containerSnap.data();
        const links = containerData.links || [];

        const initialCount = links.length;
        const updatedLinks = links.filter((link: Link) => !linkIds.includes(link.id));

        if (updatedLinks.length === initialCount) {
          console.warn('No links were removed. Check if link IDs are correct.');
        }

        await updateDoc(containerRef, {
          links: updatedLinks,
          updatedAt: serverTimestamp()
        });
      } else {
        throw new Error('Container not found');
      }
    } catch (error) {
      console.error('Error deleting links from container:', error);
      throw error;
    }
  }

  // Real-time listener for container changes
  static subscribeToContainer(containerId: string, callback: (container: Container | null) => void): () => void {
    const docRef = doc(db, CONTAINERS_COLLECTION, containerId);

    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const container: Container = {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Container;
        callback(container);
      } else {
        callback(null);
      }
    });
  }
  // Reorder containers by updating their order field
  static async reorderContainers(containerOrders: { id: string; order: number }[]): Promise<void> {
    try {
      await Promise.all(
        containerOrders.map(({ id, order }) => {
          const docRef = doc(db, CONTAINERS_COLLECTION, id);
          return updateDoc(docRef, { order });
        })
      );
    } catch (error) {
      console.error('Error reordering containers:', error);
      throw new Error('Failed to reorder containers');
    }
  }
}

