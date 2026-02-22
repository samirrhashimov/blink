import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    LinkIcon,
    Copy,
    Edit,
    Trash2,
    ExternalLink,
    GripVertical,
    ArrowRightLeft,
    Pin,
    BarChart2,
    MoreVertical,
    Check,
    QrCode
} from 'lucide-react';
import type { Link as LinkType } from '../types';
import LinkPreviewService from '../services/linkPreviewService';

interface SortableLinkItemProps {
    link: LinkType;
    canEdit: boolean;
    copiedLinkId: string | null;
    onCopy: (url: string, id: string) => void;
    onEdit: (link: LinkType) => void;
    onDelete: (link: LinkType) => void;
    onMove: (link: LinkType) => void;
    onTogglePin?: (link: LinkType) => void;
    onStats?: (link: LinkType) => void;
    onQRCode?: (link: LinkType) => void;
    onTrackClick?: (id: string) => void;
    disabled?: boolean;
    selectionMode?: boolean;
    isSelected?: boolean;
    onSelect?: (link: LinkType) => void;
    isDeleting?: boolean;
    isNewlyAdded?: boolean;
}

const SortableLinkItem: React.FC<SortableLinkItemProps> = ({
    link,
    canEdit,
    copiedLinkId,
    onCopy,
    onEdit,
    onDelete,
    onMove,
    onTogglePin,
    onStats,
    onQRCode,
    onTrackClick,
    disabled,
    selectionMode = false,
    isSelected = false,
    onSelect,
    isDeleting = false,
    isNewlyAdded = false
}) => {
    const { t } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: link.id, disabled });

    const style = {
        transform: transform ? `${CSS.Transform.toString(transform)} scale(1.02)` : CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : (menuOpen ? 50 : 1),
        opacity: isDragging ? 0.9 : 1,
    };

    const faviconUrl = LinkPreviewService.getPreviewImage(link);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        setMenuOpen(false);
        action();
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`link-item hover-inset ${isDragging ? 'dragging' : ''} ${link.isPinned ? 'pinned-link' : ''} ${menuOpen ? 'menu-active' : ''} ${isSelected ? 'selected' : ''} ${isDeleting ? 'disintegrate' : ''} ${isNewlyAdded ? 'newly-added' : ''}`}
            onClick={(e) => {
                if (selectionMode && onSelect) {
                    e.preventDefault();
                    onSelect(link);
                }
            }}
        >
            <div className="link-item-content">
                <div className="link-icon">
                    {selectionMode ? (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                                if (onSelect) onSelect(link);
                            }}
                            className="link-checkbox"
                            style={{
                                width: '22px',
                                height: '22px',
                                cursor: 'pointer',
                                accentColor: 'var(--primary)',
                                margin: 0
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : faviconUrl ? (
                        <img
                            src={faviconUrl}
                            alt={`${link.title} favicon`}
                            className="link-favicon"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('.lucide-link')) {
                                    const icon = document.createElement('div');
                                    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>';
                                    parent.appendChild(icon.firstChild!);
                                }
                            }}
                        />
                    ) : (
                        <LinkIcon />
                    )}
                </div>
                <div className="link-info">
                    <h4 className="font-medium text-gray-900 dark:text-white">{link.title}</h4>
                    {link.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{link.description}</p>
                    )}
                    <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1.5 mt-1 align-middle"
                        onClick={() => onTrackClick?.(link.id)}
                    >
                        <span>{link.url}</span>
                        <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    </a>
                    {link.tags && link.tags.length > 0 && (
                        <div className="link-tags-display">
                            {link.tags.map(tag => (
                                <span key={tag} className="link-tag-chip">#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="link-item-actions">
                <button
                    onClick={(e) => { e.stopPropagation(); onCopy(link.url, link.id); }}
                    className="action-pill copy-pill"
                    title={copiedLinkId === link.id ? t('container.menu.copied') : t('container.menu.copy')}
                >
                    {copiedLinkId === link.id ? <Check size={16} /> : <Copy size={16} />}
                </button>

                <div className="more-menu-container" ref={menuRef}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                        className={`action-pill more-pill ${menuOpen ? 'active' : ''}`}
                        title={t('container.menu.more')}
                    >
                        <MoreVertical size={18} />
                    </button>

                    {menuOpen && (
                        <div className="link-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                            <button className="menu-item" onClick={(e) => handleAction(e, () => onStats?.(link))}>
                                <BarChart2 size={16} />
                                <span>{t('container.menu.stats')}</span>
                            </button>

                            <button className="menu-item" onClick={(e) => handleAction(e, () => onQRCode?.(link))}>
                                <QrCode size={16} />
                                <span>{t('container.menu.qrCode')}</span>
                            </button>

                            {canEdit && (
                                <>
                                    {onTogglePin && (
                                        <button
                                            className={`menu-item ${link.isPinned ? 'pinned-active' : ''}`}
                                            onClick={(e) => handleAction(e, () => onTogglePin(link))}
                                        >
                                            <Pin size={16} fill={link.isPinned ? 'currentColor' : 'none'} />
                                            <span>{link.isPinned ? t('container.menu.unpin') : t('container.menu.pin')}</span>
                                        </button>
                                    )}
                                    <button className="menu-item" onClick={(e) => handleAction(e, () => onMove(link))}>
                                        <ArrowRightLeft size={16} />
                                        <span>{t('container.menu.move')}</span>
                                    </button>
                                    <button className="menu-item" onClick={(e) => handleAction(e, () => onEdit(link))}>
                                        <Edit size={16} />
                                        <span>{t('container.menu.edit')}</span>
                                    </button>
                                    <div className="menu-divider"></div>
                                    <button className="menu-item delete-item" onClick={(e) => handleAction(e, () => onDelete(link))}>
                                        <Trash2 size={16} />
                                        <span>{t('container.menu.delete')}</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {canEdit && !disabled && (
                    <div
                        className="drag-handle-new"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical size={20} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SortableLinkItem;
