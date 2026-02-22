import React from 'react';
import { Leaf, SearchX, Inbox } from 'lucide-react';

interface EmptyStateProps {
    type: 'search' | 'personal' | 'shared' | 'links';
    title: string;
    description: string;
    action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, title, description, action }) => {
    const renderIcon = () => {
        switch (type) {
            case 'search':
                return <SearchX className="text-gray-400 dark:text-gray-500" />;
            case 'links':
                return <Leaf className="text-emerald-500 dark:text-emerald-400" />;
            case 'personal':
            case 'shared':
            default:
                return <Inbox className="text-indigo-400 dark:text-indigo-500" />;
        }
    };

    return (
        <div className="empty-state-container">
            <div className="empty-state-icon-wrapper animate-bounce-slow">
                {renderIcon()}
            </div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-description">
                {description}
            </p>
            {action && (
                <div className="empty-state-action fade-in stagger-2">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
