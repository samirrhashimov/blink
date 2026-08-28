import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link as LinkIcon, Users, Lock, Edit, Trash2, LogOut, MoreVertical, Pin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Container } from '../types';
import LinkPreviewService from '../services/linkPreviewService';

interface SortableContainerCardProps {
    container: Container;
    containerColor: string;
    isLightColor: boolean;
    isNewlyAdded: boolean;
    isOpening: boolean;
    onClick: (e: React.MouseEvent) => void;
    onEdit?: (container: Container) => void;
    onDelete?: (container: Container) => void;
    onLeave?: (container: Container) => void;
    onToggleSelect?: (containerId: string) => void;
    onTogglePin?: (containerId: string) => void;
    isSelected?: boolean;
    isPinned?: boolean;
    selectionMode?: boolean;
    canEdit?: boolean;
    currentUserId?: string;
}

const SortableContainerCard: React.FC<SortableContainerCardProps> = ({
    container,
    containerColor,
    isLightColor,
    isNewlyAdded,
    isOpening,
    onClick,
    onEdit,
    onDelete,
    onLeave,
    onToggleSelect,
    onTogglePin,
    isSelected = false,
    isPinned = false,
    selectionMode = false,
    canEdit = true,
    currentUserId,
}) => {
    const { t } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{ x: number, y: number } | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: container.id });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setMenuOpen(true);
    };

    const openMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setMenuPosition({ x: rect.right, y: rect.bottom + 8 });
        setMenuOpen(true);
    };

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        setMenuOpen(false);
        action();
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        '--container-color': containerColor,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : (menuOpen ? 50 : 'auto'),
    } as React.CSSProperties;

    // Get first 4 favicons from links (use stored favicon or fall back to Google's favicon service)
    const favicons = container.links
        .filter(link => link.url && link.type !== 'text' && link.type !== 'file')
        .slice(0, 4)
        .map(link => link.favicon || LinkPreviewService.getFaviconUrl(link.url));

    const linkCount = container.links.length;

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className={`container-card hover-lift ${isLightColor ? 'light-color' : ''} ${isNewlyAdded ? 'newly-added' : ''} ${isDragging ? 'is-dragging' : ''} ${isOpening ? 'container-card-opening' : ''} ${isSelected ? 'is-selected' : ''}`}
                onClick={onClick}
                onContextMenu={handleContextMenu}
            >
                <div className="container-card-overlay" style={{ backgroundColor: containerColor }} />

                {/* Status Badges - Moved here to be relative to the card itself */}
                <div className="container-card-badges">
                    {selectionMode && (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleSelect?.(container.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="container-card-select"
                            aria-label={isSelected ? 'Deselect container' : 'Select container'}
                        />
                    )}
                    {container.isShared && (
                        <div className="container-card-badge shared" title="Shared Space">
                            <Users size={16} />
                        </div>
                    )}
                    {!container.isPublic && (
                        <div className="container-card-badge private" title="Private Space">
                            <Lock size={16} />
                        </div>
                    )}
                    {isPinned && <Pin className="container-card-pin" size={15} fill="currentColor" />}
                    <button type="button" className="container-card-menu-trigger" onClick={openMenu} aria-label="More actions">
                        <MoreVertical size={18} />
                    </button>
                </div>

                <div className="container-card-content">
                    {/* Favicon previews */}
                    {favicons.length > 0 && (
                        <div className="container-card-favicons">
                            {favicons.map((favicon, idx) => (
                                <img
                                    key={idx}
                                    src={favicon}
                                    alt=""
                                    className="container-card-favicon"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ))}
                            {(() => {
                                const totalFaviconLinks = container.links.filter(l => l.url && l.type !== 'text' && l.type !== 'file').length;
                                return totalFaviconLinks > 4 && (
                                    <span className="container-card-favicon-more">
                                        +{totalFaviconLinks - 4}
                                    </span>
                                );
                            })()}
                        </div>
                    )}

                    <h3 className="container-card-title">{container.name}</h3>
                    {container.description && (
                        <p className="container-card-description">{container.description}</p>
                    )}

                    {/* Link count badge */}
                    <div className="container-card-stats">
                        <span className="container-card-stat">
                            <LinkIcon size={12} />
                            {linkCount} {linkCount === 1 ? t('container.asset', 'asset') : t('container.assets', 'assets')}
                        </span>
                        {container.authorizedUsers && container.authorizedUsers.length > 0 && (
                            <span className="container-card-stat">
                                <span className="container-card-collab-dots">
                                    {container.authorizedUsers.slice(0, 3).map((_, i) => (
                                        <span key={i} className="container-card-collab-dot" />
                                    ))}
                                </span>
                                {container.authorizedUsers.length}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {menuOpen && menuPosition && createPortal(
                <div
                    ref={dropdownRef}
                    className="link-menu-dropdown"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'fixed',
                        top: menuPosition.y + 100 > window.innerHeight ? Math.max(10, menuPosition.y - 100) : menuPosition.y,
                        left: Math.max(10, Math.min(menuPosition.x, window.innerWidth - 200)),
                        zIndex: 100000,
                        width: 'max-content',
                        minWidth: '160px'
                    }}
                >
                    <button className="menu-item" onClick={(e) => handleAction(e, () => onTogglePin?.(container.id))}>
                        <Pin size={16} fill={isPinned ? 'currentColor' : 'none'} />
                        <span>{isPinned ? t('container.menu.unpin') : t('container.menu.pin')}</span>
                    </button>
                    {container.ownerId === currentUserId ? (
                        <>
                            {canEdit && (
                                <button className="menu-item" onClick={(e) => handleAction(e, () => onEdit?.(container))}>
                                    <Edit size={16} />
                                    <span>{t('container.actions.editContainer')}</span>
                                </button>
                            )}
                            <div className="menu-divider"></div>
                            <button className="menu-item delete-item" onClick={(e) => handleAction(e, () => onDelete?.(container))}>
                                <Trash2 size={16} />
                                <span>{t('container.actions.deleteContainer')}</span>
                            </button>
                        </>
                    ) : (
                        <button className="menu-item delete-item" onClick={(e) => handleAction(e, () => onLeave?.(container))}>
                            <LogOut size={16} />
                            <span>{t('container.actions.leaveContainer')}</span>
                        </button>
                    )}
                </div>,
                document.body
            )}
        </>
    );
};

export default SortableContainerCard;
