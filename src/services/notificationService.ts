import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Notification } from '../types/notification';

const NOTIFICATIONS_COLLECTION = 'notifications';

export class NotificationService {
  // Create a notification
  static async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    relatedId?: string,
    actionUrl?: string,
    triggeredBy?: string,
    triggeredByName?: string
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
        userId,
        type,
        title,
        message,
        relatedId,
        actionUrl,
        triggeredBy,
        triggeredByName,
        read: false,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  // Get user notifications
  static async getUserNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const notifications: Notification[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Notification);
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  // Get unread notifications count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(docRef, {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map(doc =>
        updateDoc(doc.ref, { read: true })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw new Error('Failed to mark all as read');
    }
  }

  // Delete a notification
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  // Delete all notifications for a user
  static async deleteAllNotifications(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw new Error('Failed to delete all notifications');
    }
  }

  // Helper: Create invitation notification
  static async notifyInvitation(
    userId: string,
    containerName: string,
    inviterName: string,
    inviteId: string,
    inviterId?: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'invite',
      'New Container Invitation',
      `${inviterName} invited you to collaborate on "${containerName}"`,
      inviteId,
      `/invitations`,
      inviterId,
      inviterName
    );
  }

  // Helper: Create share notification
  static async notifyContainerShared(
    userId: string,
    containerName: string,
    sharerName: string,
    containerId: string,
    sharerId?: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'share',
      'Share Successful',
      `${sharerName} accepted your invitation to "${containerName}"`,
      containerId,
      `/container/${containerId}`,
      sharerId,
      sharerName
    );
  }

  // Helper: Create update notification
  static async notifyContainerUpdate(
    userId: string,
    containerName: string,
    updaterName: string,
    containerId: string,
    updaterId?: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'update',
      'Container Updated',
      `${updaterName} made changes to "${containerName}"`,
      containerId,
      `/container/${containerId}`,
      updaterId,
      updaterName
    );
  }

  // Helper: Create invitation declined notification
  static async notifyInvitationDeclined(
    userId: string,
    containerName: string,
    declinerName: string,
    containerId: string,
    declinerId?: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'share',
      'Invitation Declined',
      `${declinerName} declined your invitation to "${containerName}"`,
      containerId,
      `/container/${containerId}`,
      declinerId,
      declinerName
    );
  }

  // Helper: Create container left notification
  static async notifyContainerLeft(
    userId: string,
    containerName: string,
    leaverName: string,
    containerId: string,
    leaverId?: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'share',
      'Collaborator Left',
      `${leaverName} left "${containerName}"`,
      containerId,
      `/container/${containerId}`,
      leaverId,
      leaverName
    );
  }
}
