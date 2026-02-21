import React, { useState, useEffect } from 'react';
import CreateContainerModal from './CreateContainerModal';
import { useAuth } from '../contexts/AuthContext';

const GlobalModals: React.FC = () => {
    const { currentUser } = useAuth();
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            setShowCreateModal(false);
            return;
        }

        (window as any).dispatchSetShowCreateModal = setShowCreateModal;
        return () => {
            delete (window as any).dispatchSetShowCreateModal;
        };
    }, [currentUser]);

    if (!currentUser) return null;

    return (
        <>
            <CreateContainerModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </>
    );
};

export default GlobalModals;
