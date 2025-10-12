export interface Notification {
  id: string;
  userId: string;
  type: 'invite' | 'share' | 'comment' | 'mention' | 'update';
  title: string;
  message: string;
  relatedId?: string; // vault ID, invite ID, etc.
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  triggeredBy?: string; // User ID who triggered the notification
  triggeredByName?: string; // Display name of the user who triggered it
}
