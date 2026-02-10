import React, { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useVault } from '../contexts/VaultContext';
import type { Link } from '../types';

interface MoveLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    link?: Link;
    linkIds?: string[];
    currentVaultId: string;
    vaultColor?: string;
}

const MoveLinkModal: React.FC<MoveLinkModalProps> = ({
    isOpen,
    onClose,
    link,
    linkIds,
    currentVaultId,
    vaultColor
}) => {
    const { t } = useTranslation();

    const { vaults, moveLinkToVault, moveLinksToVault } = useVault();
    const [targetVaultId, setTargetVaultId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Filter out the current vault and only show vaults where user has edit permission
    // For simplicity, we'll show all vaults where user is owner or authorized user
    const availableVaults = vaults.filter(v => v.id !== currentVaultId);

    const handleMove = async () => {
        if (!targetVaultId) {
            setError(t('vault.modals.moveLink.errors.selectVault'));
            return;
        }

        try {
            setLoading(true);
            setError('');

            if (linkIds && linkIds.length > 0) {
                // Bulk move
                await moveLinksToVault(currentVaultId, targetVaultId, linkIds);
            } else if (link) {
                // Single move
                await moveLinkToVault(currentVaultId, targetVaultId, link.id);
            }

            onClose();
        } catch (err: any) {
            setError(err.message || t('vault.modals.moveLink.errors.failed'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ '--primary': vaultColor } as React.CSSProperties}
            >
                <div className="modal-header">
                    <h2>{t('vault.modals.moveLink.title')}</h2>
                    <button onClick={onClose} className="modal-close">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}

                    <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {linkIds && linkIds.length > 0
                                ? t('vault.modals.moveLink.bulkTitle', { count: linkIds.length })
                                : t('vault.modals.moveLink.singleTitle', { title: link?.title })
                            }
                        </p>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
                            {availableVaults.length === 0 ? (
                                <p className="text-center py-4 text-gray-500">{t('vault.modals.moveLink.noVaults')}</p>
                            ) : (
                                availableVaults.map((vault) => (
                                    <label
                                        key={vault.id}
                                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${targetVaultId === vault.id
                                            ? 'vault-select-item-selected'
                                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="targetVault"
                                            value={vault.id}
                                            checked={targetVaultId === vault.id}
                                            onChange={(e) => setTargetVaultId(e.target.value)}
                                            className="hidden"
                                        />
                                        <div
                                            className="w-3 h-3 rounded-full mr-3"
                                            style={{ backgroundColor: vault.color || 'var(--primary)' }}
                                        />
                                        <span className="font-medium text-gray-900 dark:text-white">{vault.name}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="btn-cancel"
                    >
                        {t('common.buttons.cancel')}
                    </button>
                    <button
                        onClick={handleMove}
                        disabled={loading || !targetVaultId}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                {t('vault.modals.moveLink.buttons.moving')}
                            </>
                        ) : (
                            <>
                                <ArrowRightLeft size={18} />
                                {linkIds && linkIds.length > 0
                                    ? t('vault.modals.moveLink.buttons.moveLinks')
                                    : t('vault.modals.moveLink.buttons.moveLink')
                                }
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MoveLinkModal;
