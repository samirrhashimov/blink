import React from 'react';
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
    BarChart2
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
    onTrackClick?: (id: string) => void;
    disabled?: boolean;
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
    onTrackClick,
    disabled
}) => {
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
        zIndex: isDragging ? 100 : 1,
        opacity: isDragging ? 0.9 : 1,
    };

    const faviconUrl = LinkPreviewService.getPreviewImage(link);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`link-item ${isDragging ? 'dragging' : ''} ${link.isPinned ? 'pinned-link' : ''}`}
        >
            <div className="link-item-content">
                <div className="link-icon">
                    {faviconUrl ? (
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
                    onClick={() => onCopy(link.url, link.id)}
                    className="copy-button"
                    title={copiedLinkId === link.id ? 'Copied!' : 'Copy URL'}
                >
                    {copiedLinkId === link.id ? '✓' : <Copy size={18} />}
                </button>
                {canEdit && onTogglePin && (
                    <button
                        onClick={() => onTogglePin(link)}
                        className={`copy-button ${link.isPinned ? 'text-primary' : ''}`}
                        title={link.isPinned ? 'Unpin link' : 'Pin link to top'}
                    >
                        <Pin size={18} fill={link.isPinned ? 'currentColor' : 'none'} style={{ transform: link.isPinned ? 'none' : 'rotate(45deg)' }} />
                    </button>
                )}
                <button
                    onClick={() => onStats?.(link)}
                    className="copy-button"
                    title="View statistics"
                >
                    <BarChart2 size={18} />
                </button>
                {canEdit && (
                    <>
                        <button
                            onClick={() => onMove(link)}
                            className="copy-button"
                            title="Move to another container"
                        >
                            <ArrowRightLeft size={18} />
                        </button>
                        <button
                            onClick={() => onEdit(link)}
                            className="copy-button"
                            title="Edit link"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            onClick={() => onDelete(link)}
                            className="copy-button text-red-600 dark:text-red-400"
                            title="Delete link"
                        >
                            <Trash2 size={18} />
                        </button>
                    </>
                )}
                {canEdit && !disabled && (
                    <div
                        className="drag-handle"
                        {...attributes}
                        {...listeners}
                        style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: '#94a3b8', marginLeft: '0.25rem' }}
                    >
                        <GripVertical size={20} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SortableLinkItem;
