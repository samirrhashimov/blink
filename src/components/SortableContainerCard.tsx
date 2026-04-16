import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link as LinkIcon, Users, Lock } from 'lucide-react';
import type { Container } from '../types';

interface SortableContainerCardProps {
    container: Container;
    containerColor: string;
    isLightColor: boolean;
    isNewlyAdded: boolean;
    isOpening: boolean;
    onClick: (e: React.MouseEvent) => void;
}

const SortableContainerCard: React.FC<SortableContainerCardProps> = ({
    container,
    containerColor,
    isLightColor,
    isNewlyAdded,
    isOpening,
    onClick,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: container.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        '--container-color': containerColor,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 'auto',
    } as React.CSSProperties;

    // Get first 4 favicons from links
    const favicons = container.links
        .filter(link => link.favicon)
        .slice(0, 4)
        .map(link => link.favicon!);

    const linkCount = container.links.length;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`container-card hover-lift ${isLightColor ? 'light-color' : ''} ${isNewlyAdded ? 'newly-added' : ''} ${isDragging ? 'is-dragging' : ''} ${isOpening ? 'container-card-opening' : ''}`}
            onClick={onClick}
        >
            <div className="container-card-overlay" style={{ backgroundColor: containerColor }} />

            {/* Status Badges - Moved here to be relative to the card itself */}
            <div className="container-card-badges">
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
                        {container.links.length > 4 && container.links.filter(l => l.favicon).length > 4 && (
                            <span className="container-card-favicon-more">
                                +{container.links.filter(l => l.favicon).length - 4}
                            </span>
                        )}
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
                        {linkCount} {linkCount === 1 ? 'link' : 'links'}
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
    );
};

export default SortableContainerCard;
