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
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ShareInvite, ContainerPermission } from '../types';
import { UserService } from './userService';

const INVITES_COLLECTION = 'shareInvites';
const PERMISSIONS_COLLECTION = 'vaultPermissions';

export class SharingService {
  // Send an invitation to share a container
  static async sendInvitation(
    containerId: string,
    email: string,
    permission: 'view' | 'comment' | 'edit',
    invitedBy: string,
    containerName?: string,
    inviterName?: string
  ): Promise<string> {
    try {
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();
      
      // Check if invitation already exists
      const existingInviteQuery = query(
        collection(db, INVITES_COLLECTION),
        where('containerId', '==', containerId),
        where('email', '==', normalizedEmail),
        where('status', '==', 'pending')
      );
      const existingInvites = await getDocs(existingInviteQuery);
      
      if (!existingInvites.empty) {
        throw new Error('An invitation has already been sent to this email');
      }

      // Create expiration date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const inviteData: any = {
        containerId,
        email: normalizedEmail,
        permission,
        invitedBy,
        createdAt: serverTimestamp(),
        expiresAt,
        status: 'pending'
      };
      
      // Add optional fields if provided
      if (containerName) inviteData.containerName = containerName;
      if (inviterName) inviteData.inviterName = inviterName;

      const docRef = await addDoc(collection(db, INVITES_COLLECTION), inviteData);

      // If user exists, we could send them a notification
      // For now, we'll just create the invite
      
      return docRef.id;
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      throw new Error(error.message || 'Failed to send invitation');
    }
  }

  // Get all pending invitations for a container
  static async getContainerInvitations(containerId: string): Promise<ShareInvite[]> {
    try {
      const q = query(
        collection(db, INVITES_COLLECTION),
        where('containerId', '==', containerId),
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(q);
      const invites: ShareInvite[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        invites.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt)
        } as ShareInvite);
      });

      return invites;
    } catch (error) {
      console.error('Error fetching invitations:', error);
      throw new Error('Failed to fetch invitations');
    }
  }

  // Accept an invitation
  static async acceptInvitation(inviteId: string, userId: string): Promise<void> {
    try {
      const inviteRef = doc(db, INVITES_COLLECTION, inviteId);
      const inviteSnap = await getDoc(inviteRef);
      
      if (!inviteSnap.exists()) {
        throw new Error('Invitation not found');
      }

      const inviteData = inviteSnap.data();
      
      // Check if invitation has expired
      const expiresAt = inviteData.expiresAt?.toDate ? inviteData.expiresAt.toDate() : new Date(inviteData.expiresAt);
      if (expiresAt < new Date()) {
        throw new Error('Invitation has expired');
      }

      // Create permission record first
      await this.setUserPermission(inviteData.containerId, userId, inviteData.permission, inviteData.invitedBy);

      // Add user to container's authorized users using arrayUnion (no read needed)
      const containerRef = doc(db, 'vaults', inviteData.containerId);
      await updateDoc(containerRef, {
        authorizedUsers: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });

      // Update invitation status last
      await updateDoc(inviteRef, {
        status: 'accepted',
        acceptedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      throw new Error(error.message || 'Failed to accept invitation');
    }
  }

  // Decline an invitation
  static async declineInvitation(inviteId: string): Promise<void> {
    try {
      const inviteRef = doc(db, INVITES_COLLECTION, inviteId);
      await updateDoc(inviteRef, {
        status: 'declined',
        declinedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error declining invitation:', error);
      throw new Error('Failed to decline invitation');
    }
  }

  // Cancel an invitation (by the person who sent it)
  static async cancelInvitation(inviteId: string): Promise<void> {
    try {
      const inviteRef = doc(db, INVITES_COLLECTION, inviteId);
      await deleteDoc(inviteRef);
    } catch (error) {
      console.error('Error canceling invitation:', error);
      throw new Error('Failed to cancel invitation');
    }
  }

  // Set user permission for a container
  static async setUserPermission(
    containerId: string,
    userId: string,
    permission: 'view' | 'comment' | 'edit',
    grantedBy: string
  ): Promise<void> {
    try {
      // Check if permission already exists
      const q = query(
        collection(db, PERMISSIONS_COLLECTION),
        where('containerId', '==', containerId),
        where('userId', '==', userId)
      );
      
      const existingPermissions = await getDocs(q);
      
      if (!existingPermissions.empty) {
        // Update existing permission
        const permissionDoc = existingPermissions.docs[0];
        await updateDoc(doc(db, PERMISSIONS_COLLECTION, permissionDoc.id), {
          permission,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new permission
        await addDoc(collection(db, PERMISSIONS_COLLECTION), {
          containerId,
          userId,
          permission,
          grantedBy,
          grantedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error setting user permission:', error);
      throw new Error('Failed to set user permission');
    }
  }

  // Get user permission for a container
  static async getUserPermission(containerId: string, userId: string): Promise<ContainerPermission | null> {
    try {
      const q = query(
        collection(db, PERMISSIONS_COLLECTION),
        where('containerId', '==', containerId),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const data = querySnapshot.docs[0].data();
      return {
        userId: data.userId,
        permission: data.permission,
        grantedBy: data.grantedBy,
        grantedAt: data.grantedAt?.toDate() || new Date()
      } as ContainerPermission;
    } catch (error) {
      console.error('Error getting user permission:', error);
      return null;
    }
  }

  // Get all permissions for a container
  static async getContainerPermissions(containerId: string): Promise<ContainerPermission[]> {
    try {
      const q = query(
        collection(db, PERMISSIONS_COLLECTION),
        where('containerId', '==', containerId)
      );
      
      const querySnapshot = await getDocs(q);
      const permissions: ContainerPermission[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        permissions.push({
          userId: data.userId,
          permission: data.permission,
          grantedBy: data.grantedBy,
          grantedAt: data.grantedAt?.toDate() || new Date()
        } as ContainerPermission);
      });

      return permissions;
    } catch (error) {
      console.error('Error fetching container permissions:', error);
      throw new Error('Failed to fetch container permissions');
    }
  }

  // Remove user from container
  static async removeUserFromContainer(containerId: string, userId: string): Promise<void> {
    try {
      // Remove from authorized users
      const containerRef = doc(db, 'vaults', containerId);
      const containerSnap = await getDoc(containerRef);
      
      if (containerSnap.exists()) {
        const containerData = containerSnap.data();
        const authorizedUsers = containerData.authorizedUsers || [];
        
        await updateDoc(containerRef, {
          authorizedUsers: authorizedUsers.filter((id: string) => id !== userId),
          updatedAt: serverTimestamp()
        });
      }

      // Remove permission record
      const q = query(
        collection(db, PERMISSIONS_COLLECTION),
        where('containerId', '==', containerId),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(doc(db, PERMISSIONS_COLLECTION, docSnapshot.id));
      });
    } catch (error) {
      console.error('Error removing user from container:', error);
      throw new Error('Failed to remove user from container');
    }
  }

  // Get user's pending invitations
  static async getUserInvitations(email: string): Promise<ShareInvite[]> {
    try {
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();
      
      const q = query(
        collection(db, INVITES_COLLECTION),
        where('email', '==', normalizedEmail),
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(q);
      
      // Process invitations and fetch missing inviter names
      const invitePromises = querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
        
        // Only include non-expired invitations
        if (expiresAt > new Date()) {
          let inviterName = data.inviterName;
          
          // If inviterName is missing, fetch it from the user document
          if (!inviterName && data.invitedBy) {
            try {
              inviterName = await UserService.getUserDisplayName(data.invitedBy);
            } catch (err) {
              console.log('Could not fetch inviter name:', err);
              inviterName = 'Someone';
            }
          }
          
          return {
            id: docSnapshot.id,
            ...data,
            inviterName,
            createdAt: data.createdAt?.toDate() || new Date(),
            expiresAt
          } as ShareInvite;
        }
        return null;
      });
      
      const resolvedInvites = await Promise.all(invitePromises);
      return resolvedInvites.filter((invite): invite is ShareInvite => invite !== null);
    } catch (error) {
      console.error('Error fetching user invitations:', error);
      throw new Error('Failed to fetch user invitations');
    }
  }
}
