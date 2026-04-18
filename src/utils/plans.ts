import type { UserPlan } from '../types';

export interface PlanConfig {
  id: UserPlan;
  name: string;
  price: number;
  storageLimit: number;
  fileSizeLimit: number;
  canUploadFiles: boolean;
  maxCollaborators: number;
  features: string[];
  limitations?: string[];
}

export const PLANS: Record<UserPlan, PlanConfig> = {
  'starter': {
    id: 'starter',
    name: 'Starter',
    price: 0,
    storageLimit: 0,
    fileSizeLimit: 0,
    canUploadFiles: false,
    maxCollaborators: 0,
    features: [
      'Unlimited containers',
      'Unlimited links',
      'Text notes & Markdown',
      'Public containers',
      'Cross-device sync',
      '7-day stats history',
    ],
    limitations: [
      'File uploads',
      'Collaborators',
      'Webhooks',
    ],
  },
  'pro': {
    id: 'pro',
    name: 'Pro',
    price: 5,
    storageLimit: 200,
    fileSizeLimit: 10,
    canUploadFiles: true,
    maxCollaborators: 5,
    features: [
      'Everything in Starter',
      'File uploads (200 MB storage, 10 MB per file)',
      '90-day stats history + export',
      'Up to 5 collaborators',
      'Webhooks',
      'QR code customization',
      'Priority Explore listing',
    ],
    limitations: [
      'Priority support',
    ],
  },
  'pro+': {
    id: 'pro+',
    name: 'Pro+',
    price: 10,
    storageLimit: 1024,
    fileSizeLimit: 20,
    canUploadFiles: true,
    maxCollaborators: -1, // -1 implies unlimited
    features: [
      'Everything in Pro',
      'File uploads (1 GB storage, 20 MB per file)',
      'Advanced stats history',
      'Unlimited collaborators',
      'Advanced analytics (source, device, country)',
      'Priority support',
    ],
    limitations: [],
  },
};

export const getPlanConfig = (plan?: UserPlan): PlanConfig => {
  return PLANS[plan ?? 'starter'];
};

export const canUploadFile = (plan?: UserPlan): boolean => {
  return getPlanConfig(plan).canUploadFiles;
};

export const getFileSizeLimit = (plan?: UserPlan): number => {
  return getPlanConfig(plan).fileSizeLimit;
};

export const getStorageLimit = (plan?: UserPlan): number => {
  return getPlanConfig(plan).storageLimit;
};

export const getPlanDisplayName = (plan?: UserPlan): string => {
  return getPlanConfig(plan).name;
};

export const getMaxCollaborators = (plan?: UserPlan): number => {
  return getPlanConfig(plan).maxCollaborators;
};

export const isUpgradeable = (from?: UserPlan, to?: UserPlan): boolean => {
  const order: UserPlan[] = ['starter', 'pro', 'pro+'];
  return order.indexOf(from ?? 'starter') < order.indexOf(to ?? 'starter');
};
