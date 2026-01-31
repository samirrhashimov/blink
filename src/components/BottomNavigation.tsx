import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Tag, UserPlus, Settings, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BottomNavigation: React.FC = () => {
    const { currentUser } = useAuth();

    if (!currentUser) return null;

    return (
        <nav className="bottom-nav">
            <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <Home size={24} />
                <span>Home</span>
            </NavLink>
            <NavLink to="/tags" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <Tag size={24} />
                <span>Tags</span>
            </NavLink>
            <div className="bottom-nav-item center-item" onClick={() => (window as any).dispatchSetShowCreateModal?.(true)}>
                <div className="center-item-inner">
                    <Plus size={32} />
                </div>
            </div>
            <NavLink to="/invitations" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <UserPlus size={24} />
                <span>Invite</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
                <Settings size={24} />
                <span>Settings</span>
            </NavLink>
        </nav>
    );
};

export default BottomNavigation;
