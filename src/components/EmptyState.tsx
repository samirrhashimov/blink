import React from 'react';
import { Leaf, SearchX, Inbox, BellOff, Tag, MailOpen } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface EmptyStateProps {
    type: 'search' | 'personal' | 'shared' | 'links' | 'tags' | 'notifications' | 'invitations';
    title: string;
    description: string;
    action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, title, description, action }) => {
    const { animationsEnabled } = useTheme();

    const renderIcon = () => {
        switch (type) {
            case 'search':
                return <SearchX className="text-gray-400 dark:text-gray-500" />;
            case 'links':
                return <Leaf className="text-emerald-500 dark:text-emerald-400" />;
            case 'tags':
                return <Tag className="text-amber-500 dark:text-amber-400" />;
            case 'notifications':
                return <BellOff className="text-gray-300 dark:text-gray-600" />;
            case 'invitations':
                return <MailOpen className="text-amber-500 dark:text-amber-400" />;
            case 'personal':
            case 'shared':
            default:
                return <Inbox className="text-indigo-400 dark:text-indigo-500" />;
        }
    };

    return (
        <div className="empty-state-container">
            <div className={`empty-state-icon-wrapper ${animationsEnabled ? 'animate-bounce-slow' : ''}`}>
                {renderIcon()}
            </div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-description">
                {description}
            </p>
            {action && (
                <div className={`empty-state-action ${animationsEnabled ? 'fade-in stagger-2' : ''}`}>
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
