import React, { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useContainer } from '../contexts/ContainerContext';
import type { Link } from '../types';

interface MoveLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    link?: Link;
    linkIds?: string[];
    currentContainerId: string;
    containerColor?: string;
}

const MoveLinkModal: React.FC<MoveLinkModalProps> = ({
    isOpen,
    onClose,
    link,
    linkIds,
    currentContainerId,
    containerColor
}) => {
    const { t } = useTranslation();

    const { containers, moveLinkToContainer, moveLinksToContainer } = useContainer();
    const [targetContainerId, setTargetContainerId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Filter out the current container and only show containers where user has edit permission
    // For simplicity, we'll show all containers where user is owner or authorized user
    const availableContainers = containers.filter(v => v.id !== currentContainerId);

    const handleMove = async () => {
        if (!targetContainerId) {
            setError(t('container.modals.moveLink.errors.selectContainer'));
            return;
        }

        try {
            setLoading(true);
            setError('');

            if (linkIds && linkIds.length > 0) {
                // Bulk move
                await moveLinksToContainer(currentContainerId, targetContainerId, linkIds);
            } else if (link) {
                // Single move
                await moveLinkToContainer(currentContainerId, targetContainerId, link.id);
            }

            onClose();
        } catch (err: any) {
            setError(err.message || t('container.modals.moveLink.errors.failed'));
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
                style={{ '--primary': containerColor } as React.CSSProperties}
            >
                <div className="modal-header">
                    <h2>{t('container.modals.moveLink.title')}</h2>
                    <button onClick={onClose} className="modal-close">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}

                    <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {linkIds && linkIds.length > 0
                                ? t('container.modals.moveLink.bulkTitle', { count: linkIds.length })
                                : t('container.modals.moveLink.singleTitle', { title: link?.title })
                            }
                        </p>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
                            {availableContainers.length === 0 ? (
                                <p className="text-center py-4 text-gray-500">{t('container.modals.moveLink.noContainers')}</p>
                            ) : (
                                availableContainers.map((container) => (
                                    <label
                                        key={container.id}
                                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${targetContainerId === container.id
                                            ? 'container-select-item-selected'
                                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="targetContainer"
                                            value={container.id}
                                            checked={targetContainerId === container.id}
                                            onChange={(e) => setTargetContainerId(e.target.value)}
                                            className="hidden"
                                        />
                                        <div
                                            className="w-3 h-3 rounded-full mr-3"
                                            style={{ backgroundColor: container.color || 'var(--primary)' }}
                                        />
                                        <span className="font-medium text-gray-900 dark:text-white">{container.name}</span>
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
                        disabled={loading || !targetContainerId}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                {t('container.modals.moveLink.buttons.moving')}
                            </>
                        ) : (
                            <>
                                <ArrowRightLeft size={18} />
                                {linkIds && linkIds.length > 0
                                    ? t('container.modals.moveLink.buttons.moveLinks')
                                    : t('container.modals.moveLink.buttons.moveLink')
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
