import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { VaultService } from '../services/vaultService';
import type { Vault, Link } from '../types';

interface VaultContextType {
  vaults: Vault[];
  loading: boolean;
  error: string | null;
  createVault: (name: string, description?: string) => Promise<void>;
  updateVault: (vaultId: string, updates: Partial<Vault>) => Promise<void>;
  deleteVault: (vaultId: string) => Promise<void>;
  addLinkToVault: (vaultId: string, link: Omit<Link, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  updateLinkInVault: (vaultId: string, linkId: string, updates: Partial<Link>) => Promise<void>;
  deleteLinkFromVault: (vaultId: string, linkId: string) => Promise<void>;
  shareVault: (vaultId: string, userId: string, permission: 'view' | 'comment' | 'edit') => Promise<void>;
  refreshVaults: () => Promise<void>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const useVault = () => {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVaults = async () => {
    if (!currentUser) {
      setVaults([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const userVaults = await VaultService.getUserVaults(currentUser.uid);
      setVaults(userVaults);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vaults');
      console.error('Error fetching vaults:', err);
    } finally {
      setLoading(false);
    }
  };

  const createVault = async (name: string, description?: string) => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      setError(null);
      const vaultData = {
        name,
        description: description || '',
        ownerId: currentUser.uid,
        authorizedUsers: [],
        links: [],
        isShared: false
      };

      await VaultService.createVault(vaultData);
      await fetchVaults(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to create vault');
      throw err;
    }
  };

  const updateVault = async (vaultId: string, updates: Partial<Vault>) => {
    try {
      setError(null);
      await VaultService.updateVault(vaultId, updates);
      
      // Update local state
      setVaults(prevVaults => 
        prevVaults.map(vault => 
          vault.id === vaultId 
            ? { ...vault, ...updates, updatedAt: new Date() }
            : vault
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update vault');
      throw err;
    }
  };

  const deleteVault = async (vaultId: string) => {
    try {
      setError(null);
      await VaultService.deleteVault(vaultId);
      
      // Remove from local state
      setVaults(prevVaults => prevVaults.filter(vault => vault.id !== vaultId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete vault');
      throw err;
    }
  };

  const addLinkToVault = async (vaultId: string, link: Omit<Link, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      setError(null);
      const linkData = {
        ...link,
        createdBy: currentUser.uid
      };
      
      await VaultService.addLinkToVault(vaultId, linkData);
      
      // Update local state
      const newLink: Link = {
        id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...linkData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setVaults(prevVaults => 
        prevVaults.map(vault => 
          vault.id === vaultId 
            ? { 
                ...vault, 
                links: [...vault.links, newLink],
                updatedAt: new Date()
              }
            : vault
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to add link');
      throw err;
    }
  };

  const updateLinkInVault = async (vaultId: string, linkId: string, updates: Partial<Link>) => {
    try {
      setError(null);
      await VaultService.updateLinkInVault(vaultId, linkId, updates);
      
      // Update local state
      setVaults(prevVaults => 
        prevVaults.map(vault => 
          vault.id === vaultId 
            ? {
                ...vault,
                links: vault.links.map(link => 
                  link.id === linkId 
                    ? { ...link, ...updates, updatedAt: new Date() }
                    : link
                ),
                updatedAt: new Date()
              }
            : vault
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update link');
      throw err;
    }
  };

  const deleteLinkFromVault = async (vaultId: string, linkId: string) => {
    try {
      setError(null);
      await VaultService.deleteLinkFromVault(vaultId, linkId);
      
      // Update local state
      setVaults(prevVaults => 
        prevVaults.map(vault => 
          vault.id === vaultId 
            ? {
                ...vault,
                links: vault.links.filter(link => link.id !== linkId),
                updatedAt: new Date()
              }
            : vault
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to delete link');
      throw err;
    }
  };

  const shareVault = async (vaultId: string, userId: string, permission: 'view' | 'comment' | 'edit') => {
    try {
      setError(null);
      await VaultService.shareVault(vaultId, userId, permission);
      await fetchVaults(); // Refresh to get updated sharing info
    } catch (err: any) {
      setError(err.message || 'Failed to share vault');
      throw err;
    }
  };

  const refreshVaults = async () => {
    await fetchVaults();
  };

  useEffect(() => {
    fetchVaults();
  }, [currentUser]);

  const value: VaultContextType = {
    vaults,
    loading,
    error,
    createVault,
    updateVault,
    deleteVault,
    addLinkToVault,
    updateLinkInVault,
    deleteLinkFromVault,
    shareVault,
    refreshVaults
  };

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  );
};
