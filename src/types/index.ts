export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  favicon?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
  order?: number; // Optional order field
  tags?: string[];
  isPinned?: boolean;
  clicks?: number;
  clickStats?: Record<string, number>; // Format: { "YYYY-MM-DD": count }
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
