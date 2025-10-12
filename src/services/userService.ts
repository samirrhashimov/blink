import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export class UserService {
  /**
   * Get user's display name from Firebase
   * Falls back to email if displayName is not set
   */
  static async getUserDisplayName(userId: string): Promise<string> {
    try {
      console.log(`[UserService] Fetching user document for userId: ${userId}`);
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log(`[UserService] User document found:`, userData);
        const displayName = userData.displayName || userData.email || 'Unknown User';
        console.log(`[UserService] Returning display name: ${displayName}`);
        return displayName;
      }
      
      console.warn(`[UserService] User document does not exist for userId: ${userId}`);
      return 'Unknown User';
    } catch (error) {
      console.error('[UserService] Error fetching user display name:', error);
      return 'Unknown User';
    }
  }

  /**
   * Get user data from Firebase
   */
  static async getUserData(userId: string): Promise<any> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  /**
   * Format user name for display
   * Prioritizes displayName, falls back to email, then 'Unknown User'
   */
  static formatUserName(displayName?: string | null, email?: string | null): string {
    if (displayName && displayName.trim()) {
      return displayName.trim();
    }
    if (email && email.trim()) {
      // Extract name part from email if no display name
      const emailName = email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'Unknown User';
  }
}
