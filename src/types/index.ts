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
}

export interface Vault {
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
}

export interface VaultPermission {
  userId: string;
  permission: 'view' | 'comment' | 'edit';
  grantedBy: string;
  grantedAt: Date;
}

export interface ShareInvite {
  id: string;
  vaultId: string;
  vaultName?: string;
  email: string;
  permission: 'view' | 'comment' | 'edit';
  invitedBy: string;
  inviterName?: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'declined';
}
