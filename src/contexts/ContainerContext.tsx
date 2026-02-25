import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { ContainerService } from '../services/containerService';
import type { Container, Link } from '../types';

interface ContainerContextType {
  containers: Container[];
  loading: boolean;
  error: string | null;
  createContainer: (name: string, description?: string, color?: string) => Promise<void>;
  updateContainer: (containerId: string, updates: Partial<Container>) => Promise<void>;
  deleteContainer: (containerId: string) => Promise<void>;
  addLinkToContainer: (containerId: string, link: Omit<Link, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<string>;
  updateLinkInContainer: (containerId: string, linkId: string, updates: Partial<Link>) => Promise<void>;
  deleteLinkFromContainer: (containerId: string, linkId: string) => Promise<void>;
  deleteLinksFromContainer: (containerId: string, linkIds: string[]) => Promise<void>;
  shareContainer: (containerId: string, userId: string, permission: 'view' | 'comment' | 'edit') => Promise<void>;
  reorderLinks: (containerId: string, links: Link[]) => Promise<void>;
  moveLinkToContainer: (sourceContainerId: string, targetContainerId: string, linkId: string) => Promise<void>;
  moveLinksToContainer: (sourceContainerId: string, targetContainerId: string, linkIds: string[]) => Promise<void>;
  trackClick: (containerId: string, linkId: string) => Promise<void>;
  refreshContainers: () => Promise<void>;
  reorderContainers: (reorderedContainers: Container[]) => Promise<void>;
}

const ContainerContext = createContext<ContainerContextType | undefined>(undefined);

export const useContainer = () => {
  const context = useContext(ContainerContext);
  if (context === undefined) {
    throw new Error('useContainer must be used within a ContainerProvider');
  }
  return context;
};

export const ContainerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContainers = async () => {
    if (!currentUser) {
      setContainers([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const userContainers = await ContainerService.getUserContainers(currentUser.uid);
      // Sort by order field if available, then by updatedAt
      userContainers.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        return 0;
      });
      setContainers(userContainers);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch containers');
    } finally {
      setLoading(false);
    }
  };

  const createContainer = async (name: string, description?: string, color?: string) => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      setError(null);
      const containerColors = ['#6366f1', '#10b981', '#f43f5e', '#d97706', '#8b5cf6', '#3b82f6', '#0891b2', '#ea580c', '#6d28d9', '#be185d'];
      const randomColor = color || containerColors[Math.floor(Math.random() * containerColors.length)];

      const containerData = {
        name,
        description: description || '',
        ownerId: currentUser.uid,
        authorizedUsers: [],
        links: [],
        isShared: false,
        color: randomColor
      };

      await ContainerService.createContainer(containerData);
      await fetchContainers(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to create container');
      throw err;
    }
  };

  const updateContainer = async (containerId: string, updates: Partial<Container>) => {
    try {
      setError(null);
      await ContainerService.updateContainer(containerId, updates);

      // Update local state
      setContainers(prevContainers =>
        prevContainers.map(container =>
          container.id === containerId
            ? { ...container, ...updates, updatedAt: new Date() }
            : container
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update container');
      throw err;
    }
  };

  const deleteContainer = async (containerId: string) => {
    try {
      setError(null);
      await ContainerService.deleteContainer(containerId);

      // Remove from local state
      setContainers(prevContainers => prevContainers.filter(container => container.id !== containerId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete container');
      throw err;
    }
  };

  const addLinkToContainer = async (containerId: string, link: Omit<Link, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      setError(null);
      const linkData = {
        ...link,
        createdBy: currentUser.uid
      };

      // Get the generated link ID from the service
      const linkId = await ContainerService.addLinkToContainer(containerId, linkData);

      // Update local state
      const newLink: Link = {
        id: linkId,
        ...linkData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setContainers(prevContainers =>
        prevContainers.map(container =>
          container.id === containerId
            ? {
              ...container,
              links: [...container.links, newLink],
              updatedAt: new Date()
            }
            : container
        )
      );

      return linkId;
    } catch (err: any) {
      setError(err.message || 'Failed to add link');
      throw err;
    }
  };

  const updateLinkInContainer = async (containerId: string, linkId: string, updates: Partial<Link>) => {
    try {
      setError(null);
      await ContainerService.updateLinkInContainer(containerId, linkId, updates);

      // Update local state
      setContainers(prevContainers =>
        prevContainers.map(container =>
          container.id === containerId
            ? {
              ...container,
              links: container.links.map(link =>
                link.id === linkId
                  ? { ...link, ...updates, updatedAt: new Date() }
                  : link
              ),
              updatedAt: new Date()
            }
            : container
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update link');
      throw err;
    }
  };

  const deleteLinkFromContainer = async (containerId: string, linkId: string) => {
    try {
      setError(null);
      await ContainerService.deleteLinkFromContainer(containerId, linkId);

      // Update local state
      setContainers(prevContainers =>
        prevContainers.map(container =>
          container.id === containerId
            ? {
              ...container,
              links: container.links.filter(link => link.id !== linkId),
              updatedAt: new Date()
            }
            : container
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to delete link');
      throw err;
    }
  };

  const deleteLinksFromContainer = async (containerId: string, linkIds: string[]) => {
    try {
      setError(null);
      await ContainerService.deleteLinksFromContainer(containerId, linkIds);

      // Update local state
      setContainers(prevContainers =>
        prevContainers.map(container =>
          container.id === containerId
            ? {
              ...container,
              links: container.links.filter(link => !linkIds.includes(link.id)),
              updatedAt: new Date()
            }
            : container
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to delete links');
      throw err;
    }
  };

  const reorderLinks = async (containerId: string, sortedLinks: Link[]) => {
    try {
      setError(null);
      // Optimistic update
      setContainers(prevContainers =>
        prevContainers.map(container =>
          container.id === containerId
            ? { ...container, links: sortedLinks, updatedAt: new Date() }
            : container
        )
      );
      await ContainerService.reorderLinks(containerId, sortedLinks);
    } catch (err: any) {
      setError(err.message || 'Failed to reorder links');
      // Revert on error if necessary - for now just refresh
      await fetchContainers();
      throw err;
    }
  };

  const moveLinkToContainer = async (sourceContainerId: string, targetContainerId: string, linkId: string) => {
    try {
      setError(null);
      await ContainerService.moveLinkToContainer(sourceContainerId, targetContainerId, linkId);
      await fetchContainers(); // Refresh to update both containers
    } catch (err: any) {
      setError(err.message || 'Failed to move link');
      throw err;
    }
  };

  const moveLinksToContainer = async (sourceContainerId: string, targetContainerId: string, linkIds: string[]) => {
    try {
      setError(null);
      await ContainerService.moveLinksToContainer(sourceContainerId, targetContainerId, linkIds);
      await fetchContainers(); // Refresh to update both containers
    } catch (err: any) {
      setError(err.message || 'Failed to move links');
      throw err;
    }
  };

  const trackClick = async (containerId: string, linkId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Optimistic local update
      setContainers(prevContainers =>
        prevContainers.map(container =>
          container.id === containerId
            ? {
              ...container,
              links: container.links.map(link => {
                if (link.id === linkId) {
                  const currentStats = link.clickStats || {};
                  return {
                    ...link,
                    clicks: (link.clicks || 0) + 1,
                    clickStats: {
                      ...currentStats,
                      [today]: (currentStats[today] || 0) + 1
                    }
                  };
                }
                return link;
              })
            }
            : container
        )
      );

      await ContainerService.trackLinkClick(containerId, linkId);
    } catch (err: any) {
      console.error('Error tracking click:', err);
    }
  };

  const shareContainer = async (containerId: string, userId: string, permission: 'view' | 'comment' | 'edit') => {
    try {
      setError(null);
      await ContainerService.shareContainer(containerId, userId, permission);
      await fetchContainers(); // Refresh to get updated sharing info
    } catch (err: any) {
      setError(err.message || 'Failed to share container');
      throw err;
    }
  };

  const refreshContainers = async () => {
    await fetchContainers();
  };

  const reorderContainers = async (reorderedContainers: Container[]) => {
    // Optimistic update
    const previousContainers = [...containers];
    setContainers(reorderedContainers);

    try {
      const orders = reorderedContainers.map((c, index) => ({ id: c.id, order: index }));
      await ContainerService.reorderContainers(orders);
    } catch (err: any) {
      // Revert on error
      setContainers(previousContainers);
      setError(err.message || 'Failed to reorder containers');
      throw err;
    }
  };

  useEffect(() => {
    fetchContainers();
  }, [currentUser]);

  const value: ContainerContextType = {
    containers,
    loading,
    error,
    createContainer,
    updateContainer,
    deleteContainer,
    addLinkToContainer,
    updateLinkInContainer,
    deleteLinkFromContainer,
    deleteLinksFromContainer,
    shareContainer,
    reorderLinks,
    moveLinkToContainer,
    moveLinksToContainer,
    trackClick,
    refreshContainers,
    reorderContainers
  };

  return (
    <ContainerContext.Provider value={value}>
      {children}
    </ContainerContext.Provider>
  );
};
