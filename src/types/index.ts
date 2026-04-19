export type UserPlan = 'starter' | 'pro' | 'pro+';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string; // base64 string stored in Firestore
  username?: string; // unique username e.g. @samirr
  followers?: string[]; // array of user UIDs
  following?: string[]; // array of user UIDs
  createdAt: Date;
  plan?: UserPlan; // subscription plan
  lemonSqueezySubscriptionId?: string;
  lemonSqueezyCustomerId?: string;
  lemonSqueezyPortalUrl?: string; // URL for managing subscription via LS portal
  lemonSqueezyUpdatePaymentUrl?: string; // URL for updating payment method
}

export type LinkType = 'link' | 'text' | 'file';

export interface Link {
  id: string;
  title: string;
  url: string; // fallback to # for text/file? or make optional
  type?: LinkType;
  content?: string; // for text entries (Markdown)
  description?: string;
  favicon?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
  order?: number; // Optional order field
  tags?: string[];
  isPinned?: boolean;
  clicks?: number;
  clickStats?: Record<string, number>; // Legacy simple count: { "YYYY-MM-DD": count }
  detailedStats?: Record<string, {
    count: number;
    countries: Record<string, number>; // { "US": 5, "TR": 2 }
    devices: Record<string, number>;   // { "mobile": 4, "desktop": 3 }
    browsers: Record<string, number>;  // { "Chrome": 5, "Safari": 2 }
  }>;
  note?: string;
  emojis?: Record<string, string>; // Format: { "userId": "emoji" }
  githubData?: {
    stars?: number;
    language?: string;
    forks?: number;
    openIssues?: number;
    ownerAvatar?: string;
    repoName?: string;
    ownerName?: string;
  };
  fileData?: {
    originalName: string;
    publicId: string;
    format: string;
    bytes: number;
    resourceType?: string;
  };
}

export interface Container {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  authorizedUsers: string[]; // Array of user IDs
  links: Link[];
  createdAt: Date;
  updatedAt: Date;
  isShared: boolean;
  coverImage?: string;
  color?: string;
  order?: number;
  isPublic?: boolean;
  discordWebhookUrl?: string;
  discordLanguage?: 'en' | 'tr';
  discordEnabled?: boolean;
  slackWebhookUrl?: string;
  slackLanguage?: 'en' | 'tr';
  slackEnabled?: boolean;
}

export interface ContainerPermission {
  userId: string;
  permission: 'view' | 'comment' | 'edit';
  grantedBy: string;
  grantedAt: Date;
}

export interface ShareInvite {
  id: string;
  containerId: string;
  containerName?: string;
  email: string;
  permission: 'view' | 'comment' | 'edit';
  invitedBy: string;
  inviterName?: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined';
}
