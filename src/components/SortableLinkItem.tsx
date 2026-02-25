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
    QrCode,
    MessageSquare,
    Smile
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
    onUpdateLink?: (linkId: string, updates: Partial<LinkType>) => void;
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
    isNewlyAdded = false,
    onUpdateLink
}) => {
    const { t } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{ x: number, y: number } | null>(null);
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [noteDraft, setNoteDraft] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);
    const noteInputRef = useRef<HTMLInputElement>(null);
    const noteContainerRef = useRef<HTMLDivElement>(null);

    const emojis = ['👍', '❤️', '🔥', '👀', '🎉', '📌', '🚀', '✅', '💡', '⚠️'];

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
                setEmojiPickerOpen(false);
            }
            if (isEditingNote && noteContainerRef.current && !noteContainerRef.current.contains(event.target as Node)) {
                setIsEditingNote(false);
            }
        };

        if (menuOpen || emojiPickerOpen || isEditingNote) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen, emojiPickerOpen, isEditingNote]);

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        setMenuOpen(false);
        setEmojiPickerOpen(false);
        setMenuPosition(null);
        action();
    };

    const handleSaveNote = () => {
        if (!onUpdateLink) return;
        setIsEditingNote(false);
        if (noteDraft !== link.note) {
            onUpdateLink(link.id, { note: noteDraft.trim() || undefined });
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        if (!onUpdateLink) return;
        setEmojiPickerOpen(false);
        setMenuOpen(false);
        // Toggle if matching, otherwise set
        onUpdateLink(link.id, { emoji: link.emoji === emoji ? undefined : emoji });
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setMenuOpen(true);
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
            onContextMenu={handleContextMenu}
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
                <div className="link-info" style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 className="font-medium text-gray-900 dark:text-white">{link.title}</h4>
                        {link.emoji && (
                            <span
                                style={{ cursor: 'pointer', fontSize: '1rem', padding: '0 2px' }}
                                onClick={(e) => {
                                    if (canEdit) {
                                        e.stopPropagation();
                                        setMenuPosition({ x: e.clientX, y: e.clientY });
                                        setEmojiPickerOpen(true);
                                    }
                                }}
                                title="Change emoji"
                            >
                                {link.emoji}
                            </span>
                        )}
                    </div>
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

                    {/* Quick Note */}
                    {(link.note || isEditingNote) && (
                        <div className="mt-2" onClick={(e) => e.stopPropagation()} ref={noteContainerRef}>
                            {isEditingNote ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '100%' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            ref={noteInputRef}
                                            type="text"
                                            value={noteDraft}
                                            maxLength={100}
                                            onChange={(e) => setNoteDraft(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveNote();
                                                if (e.key === 'Escape') setIsEditingNote(false);
                                            }}
                                            autoFocus
                                            placeholder="Write a note..."
                                            style={{
                                                flex: 1,
                                                fontSize: '0.85rem', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)',
                                                background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none'
                                            }}
                                        />
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', minWidth: '40px', textAlign: 'right' }}>
                                            {noteDraft.length}/100
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <button onClick={handleSaveNote} style={{ fontSize: '0.8rem', padding: '6px 14px', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: 500, border: 'none', cursor: 'pointer' }}>Save</button>
                                        <button onClick={() => setIsEditingNote(false)} style={{ fontSize: '0.8rem', padding: '6px 14px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                                        {link.note && (
                                            <button
                                                onClick={() => {
                                                    setIsEditingNote(false);
                                                    if (onUpdateLink) onUpdateLink(link.id, { note: '' });
                                                }}
                                                style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '6px 14px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer' }}
                                                title="Delete note"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        display: 'flex',
                                        width: 'fit-content',
                                        alignItems: 'flex-start',
                                        gap: '6px',
                                        padding: '6px 10px',
                                        background: 'rgba(99, 102, 241, 0.08)',
                                        color: 'var(--text-secondary)',
                                        borderRadius: '8px',
                                        fontSize: '0.75rem',
                                        cursor: canEdit ? 'pointer' : 'default',
                                        border: '1px solid rgba(99, 102, 241, 0.15)',
                                        maxWidth: '100%',
                                        boxSizing: 'border-box',
                                        lineHeight: '1.4'
                                    }}
                                    onClick={() => {
                                        if (canEdit) {
                                            setNoteDraft(link.note || '');
                                            setIsEditingNote(true);
                                        }
                                    }}
                                    title="Edit Note"
                                >
                                    <MessageSquare size={13} style={{ color: '#6366f1', marginTop: '2px', flexShrink: 0 }} />
                                    <span style={{ overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{link.note}</span>
                                </div>
                            )}
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
                        onClick={(e) => { e.stopPropagation(); setMenuPosition(null); setMenuOpen(!menuOpen); }}
                        className={`action-pill more-pill ${menuOpen ? 'active' : ''}`}
                        title={t('container.menu.more')}
                    >
                        <MoreVertical size={18} />
                    </button>

                    {menuOpen && (
                        <div
                            className="link-menu-dropdown"
                            onClick={(e) => e.stopPropagation()}
                            style={menuPosition ? {
                                position: 'fixed',
                                top: menuPosition.y,
                                left: menuPosition.x,
                                right: 'auto',
                                transform: 'none',
                                zIndex: 10000
                            } : {}}
                        >
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
                                    <button
                                        className="menu-item"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setNoteDraft(link.note || '');
                                            setIsEditingNote(true);
                                            setMenuOpen(false);
                                        }}
                                    >
                                        <MessageSquare size={16} />
                                        <span>{link.note ? 'Edit Note' : 'Add Note'}</span>
                                    </button>
                                    <button
                                        className="menu-item"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEmojiPickerOpen(true);
                                            setMenuOpen(false);
                                            setMenuPosition({ x: e.clientX, y: e.clientY });
                                        }}
                                    >
                                        <Smile size={16} />
                                        <span>Reaction</span>
                                    </button>

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

                {/* Emoji Picker Modal overlay logic */}
                {emojiPickerOpen && (
                    <div
                        className="link-menu-dropdown emoji-grid"
                        onClick={(e) => e.stopPropagation()}
                        style={menuPosition ? {
                            position: 'fixed',
                            top: menuPosition.y,
                            left: menuPosition.x,
                            right: 'auto',
                            transform: 'none',
                            zIndex: 10000,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: '8px',
                            padding: '12px',
                            width: 'max-content'
                        } : {}}
                    >
                        {emojis.map(em => (
                            <button
                                key={em}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleEmojiSelect(em);
                                }}
                                style={{
                                    background: link.emoji === em ? 'var(--bg-secondary)' : 'transparent',
                                    border: link.emoji === em ? '1px solid var(--border-color)' : '1px solid transparent',
                                    borderRadius: '8px',
                                    fontSize: '1.25rem',
                                    padding: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'transform 0.1s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {em}
                            </button>
                        ))}
                    </div>
                )}

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
