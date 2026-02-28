import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    Smile,
    Star,
    GitFork,
    CircleDot,
    Code
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
    currentUserId?: string;
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
    onUpdateLink,
    currentUserId
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
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        zIndex: isDragging ? 100 : ((menuOpen || emojiPickerOpen) ? 50 : 1),
        opacity: isDragging ? 0.9 : 1,
    };

    const faviconUrl = LinkPreviewService.getPreviewImage(link);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const mousedownTarget = event.target as Node;

            const clickOutsideMenu = !menuRef.current || !menuRef.current.contains(mousedownTarget);
            const clickOutsideDropdown = !dropdownRef.current || !dropdownRef.current.contains(mousedownTarget);
            const clickOutsideEmojiPicker = !emojiPickerRef.current || !emojiPickerRef.current.contains(mousedownTarget);

            if (clickOutsideMenu && clickOutsideDropdown && clickOutsideEmojiPicker) {
                setMenuOpen(false);
                setEmojiPickerOpen(false);
            }
            if (isEditingNote && noteContainerRef.current && !noteContainerRef.current.contains(mousedownTarget)) {
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
        if (noteDraft !== (link.note || '')) {
            onUpdateLink(link.id, { note: noteDraft.trim() || "" });
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        if (!onUpdateLink || !currentUserId) return;
        setEmojiPickerOpen(false);
        setMenuOpen(false);

        const currentEmojis = link.emojis || {};
        const newEmojis = { ...currentEmojis };

        // Toggle if matching, otherwise set
        if (newEmojis[currentUserId] === emoji) {
            delete newEmojis[currentUserId];
        } else {
            newEmojis[currentUserId] = emoji;
        }

        onUpdateLink(link.id, { emojis: newEmojis });
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
            className={`link-item ${isDragging ? 'dragging' : ''} ${link.isPinned ? 'pinned-link' : ''} ${menuOpen ? 'menu-active' : ''} ${isSelected ? 'selected' : ''} ${isDeleting ? 'disintegrate' : ''} ${isNewlyAdded ? 'newly-added' : ''}`}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <h4 className="font-medium text-gray-900 dark:text-white" style={{ flex: 1, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>{link.title}</h4>
                    </div>

                    {link.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2" style={{ overflowWrap: 'anywhere' }}>{link.description}</p>
                    )}

                    {link.githubData && (
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '10px',
                            fontWeight: 700,
                            color: 'var(--text-muted)',
                            marginTop: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            {link.githubData.language && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Code size={10} />
                                    <span>{link.githubData.language}</span>
                                </div>
                            )}
                            {link.githubData.stars !== undefined && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Star size={10} className="text-yellow-500 fill-yellow-500" />
                                    <span>{link.githubData.stars.toLocaleString()}</span>
                                </div>
                            )}
                            {link.githubData.forks !== undefined && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <GitFork size={10} />
                                    <span>{link.githubData.forks.toLocaleString()}</span>
                                </div>
                            )}
                            {link.githubData.openIssues !== undefined && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <CircleDot size={10} />
                                    <span>{link.githubData.openIssues.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1 align-middle"
                        onClick={() => onTrackClick?.(link.id)}
                    >
                        <span className="truncate max-w-[200px] md:max-w-xs">{link.url.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink size={12} className="flex-shrink-0" style={{ marginLeft: '2px' }} />
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
                                            placeholder={t('container.modals.note.placeholder')}
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
                                        <button onClick={handleSaveNote} style={{ fontSize: '0.8rem', padding: '6px 14px', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: 500, border: 'none', cursor: 'pointer' }}>{t('common.buttons.save')}</button>
                                        <button onClick={() => setIsEditingNote(false)} style={{ fontSize: '0.8rem', padding: '6px 14px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>{t('common.buttons.cancel')}</button>
                                        {link.note && (
                                            <button
                                                onClick={() => {
                                                    setIsEditingNote(false);
                                                    if (onUpdateLink) onUpdateLink(link.id, { note: '' });
                                                }}
                                                style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '6px 14px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer' }}
                                                title={t('common.buttons.delete')}
                                            >
                                                {t('common.buttons.delete')}
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
                                    title={t('container.menu.editNote')}
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
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuPosition({ x: e.clientX, y: e.clientY });
                            setMenuOpen(!menuOpen);
                        }}
                        className={`action-pill more-pill ${menuOpen ? 'active' : ''}`}
                        title={t('container.menu.more')}
                    >
                        <MoreVertical size={18} />
                    </button>

                    {menuOpen && menuPosition && createPortal(
                        <div
                            ref={dropdownRef}
                            className="link-menu-dropdown"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: 'fixed',
                                top: menuPosition.y + 350 > window.innerHeight ? Math.max(10, menuPosition.y - 350) : menuPosition.y,
                                left: Math.max(10, Math.min(menuPosition.x, window.innerWidth - 220)),
                                right: 'auto',
                                transform: 'none',
                                zIndex: 100000,
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                width: 'max-content',
                                maxWidth: 'calc(100vw - 20px)'
                            }}
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
                                        <span>{link.note ? t('container.menu.editNote') : t('container.menu.addNote')}</span>
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
                                        <span>{t('container.menu.reaction')}</span>
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
                        </div>,
                        document.body
                    )}
                </div>

                {/* Emoji Picker Modal overlay logic */}
                {emojiPickerOpen && menuPosition && createPortal(
                    <div
                        ref={emojiPickerRef}
                        className="link-menu-dropdown emoji-grid"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'fixed',
                            top: menuPosition.y + 180 > window.innerHeight ? Math.max(10, menuPosition.y - 180) : menuPosition.y + 8,
                            left: Math.max(10, Math.min(menuPosition.x, window.innerWidth - 240)), // Increased margin for mobile
                            right: 'auto',
                            zIndex: 999999, // Ensure it's on top of EVERYTHING
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: '8px',
                            padding: '12px',
                            width: 'max-content',
                            maxWidth: 'calc(100vw - 20px)',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--primary)',
                            borderRadius: '12px',
                            boxSizing: 'border-box'
                        }}
                    >
                        {emojis.map(em => (
                            <button
                                key={em}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEmojiSelect(em);
                                }}
                                style={{
                                    background: (link.emojis && currentUserId && link.emojis[currentUserId] === em) ? 'rgba(var(--primary-rgb), 0.15)' : 'transparent',
                                    border: (link.emojis && currentUserId && link.emojis[currentUserId] === em) ? '1.5px solid var(--primary)' : '1.5px solid transparent',
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
                    </div>,
                    document.body
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
            {/* Emojis Display */}
            {link.emojis && Object.keys(link.emojis).length > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        left: '12px',
                        bottom: '-12px', /* Overlaps bottom edge */
                        background: 'rgba(255, 255, 255, 0.75)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid var(--primary)',
                        borderRadius: '12px',
                        padding: '2px 6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        fontSize: '1rem', // slightly smaller
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05), border 1px solid rgba(255,255,255,0.1)',
                        cursor: canEdit ? 'pointer' : 'default',
                        zIndex: 20,
                        transition: 'all 0.2s ease',
                    }}
                    className="glass-card"
                    onClick={(e) => {
                        if (canEdit && currentUserId) {
                            e.stopPropagation();
                            setMenuPosition({ x: e.clientX, y: e.clientY });
                            setEmojiPickerOpen(true);
                        }
                    }}
                >
                    {/* Render unique emojis and their counts */}
                    {(() => {
                        const emojiCounts: Record<string, number> = {};
                        Object.values(link.emojis).forEach(e => {
                            emojiCounts[e] = (emojiCounts[e] || 0) + 1;
                        });

                        const uniqueEmojis = Object.keys(emojiCounts);
                        const displayEmojis = uniqueEmojis.slice(0, 3);
                        const overflowCount = uniqueEmojis.length > 3 ? uniqueEmojis.length - 3 : 0;

                        return (
                            <>
                                {displayEmojis.map(emoji => (
                                    <span key={emoji} style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ transform: 'translateY(-0.5px)' }}>{emoji}</span>
                                        {emojiCounts[emoji] > 1 && (
                                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '2px' }}>
                                                {emojiCounts[emoji]}
                                            </span>
                                        )}
                                    </span>
                                ))}
                                {overflowCount > 0 && (
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', paddingLeft: '4px' }}>
                                        +{overflowCount}
                                    </span>
                                )}
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default SortableLinkItem;
