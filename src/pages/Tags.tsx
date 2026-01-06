import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useVault } from '../contexts/VaultContext';
import {
    Settings,
    Search,
    Tag,
    ArrowLeft,
    ExternalLink,
    ChevronRight,
    SearchX,
    Pin
} from 'lucide-react';
import blinkLogo from '../assets/blinklogo2.png';
import LoadingSkeleton from '../components/LoadingSkeleton';
import SEO from '../components/SEO';

const Tags: React.FC = () => {
    const { currentUser } = useAuth();
    const { vaults, loading } = useVault();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    if (loading) {
        return <LoadingSkeleton variant="fullscreen" />;
    }

    // Extract all unique tags
    const allLinks = vaults.flatMap(vault =>
        vault.links.map(link => ({ ...link, vaultName: vault.name, vaultId: vault.id, vaultColor: vault.color }))
    );

    const tagsMap: Record<string, typeof allLinks> = {};
    allLinks.forEach(link => {
        if (link.tags) {
            link.tags.forEach(tag => {
                if (!tagsMap[tag]) tagsMap[tag] = [];
                tagsMap[tag].push(link);
            });
        }
    });

    const uniqueTags = Object.keys(tagsMap).sort();

    // Filter tags based on search query
    const filteredTags = uniqueTags.filter(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const displayedLinks = (selectedTag ? tagsMap[selectedTag] : [])
        .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
        });

    return (
        <div className="dashboard-page">
            <SEO title="Explore Tags" description="Browse and search all your saved links across different containers using tags." />
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <div className="header-left">
                            <Link to="/dashboard" className="back-link">
                                <ArrowLeft />
                            </Link>
                            <img src={blinkLogo} alt="Blink" className="logo-image" style={{ height: '40px', width: 'auto', marginLeft: '1rem' }} />
                        </div>
                        <div className="header-right">
                            <Link to="/settings" className="theme-toggle" title="Settings">
                                <Settings size={20} />
                            </Link>
                            <div className="user-avatar text-white">
                                {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container">
                <div className="vault-header">
                    <h2>Explore by Tags</h2>
                    <p className="text-gray-500 dark:text-gray-400">Find your links across all containers using tags</p>

                    <div className="modern-search-bar mt-6">
                        <Search className="modern-search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="modern-search-input"
                        />
                    </div>
                </div>

                <div className="tags-explorer-layout">
                    {/* Tags Sidebar */}
                    <aside className="tags-sidebar">
                        <div className="sidebar-header">
                            <Tag size={18} />
                            <h3>All Tags ({uniqueTags.length})</h3>
                        </div>
                        <div className="sidebar-tags-list">
                            {filteredTags.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    <p>No tags found</p>
                                </div>
                            ) : (
                                filteredTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                        className={`sidebar-tag-item ${selectedTag === tag ? 'active' : ''}`}
                                    >
                                        <span className="tag-name">#{tag}</span>
                                        <span className="tag-count">{tagsMap[tag].length}</span>
                                        <ChevronRight size={14} className="chevron" />
                                    </button>
                                ))
                            )}
                        </div>
                    </aside>

                    {/* Links Content */}
                    <section className="tags-content">
                        {selectedTag ? (
                            <>
                                <div className="content-header">
                                    <h3>Links tagged with <span className="text-primary">#{selectedTag}</span></h3>
                                    <span className="links-count">{displayedLinks.length} items</span>
                                </div>
                                <div className="tags-links-grid">
                                    {displayedLinks.map(link => (
                                        <div key={link.id + link.vaultId} className="tag-link-card">
                                            <div className="card-top">
                                                <div className="vault-indicator" style={{ backgroundColor: link.vaultColor || '#6366f1' }}>
                                                    {link.vaultName}
                                                </div>
                                                <div className="flex items-start gap-2 flex-1 min-width-0">
                                                    <h4 className="text-gray-900 dark:text-white font-medium truncate flex-1">{link.title}</h4>
                                                    {link.isPinned && <Pin size={14} className="text-primary mt-1 flex-shrink-0" fill="currentColor" />}
                                                </div>
                                            </div>
                                            {link.description && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                                                    {link.description}
                                                </p>
                                            )}
                                            <div className="card-bottom">
                                                <a
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="tag-link-url"
                                                >
                                                    <span className="truncate">{link.url}</span>
                                                    <ExternalLink size={14} />
                                                </a>
                                                <Link
                                                    to={`/vault/${link.vaultId}`}
                                                    className="view-vault-link"
                                                    title="Go to container"
                                                >
                                                    Open Container
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : uniqueTags.length === 0 ? (
                            <div className="empty-selection-state">
                                <SearchX size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
                                <h3>No tags found yet</h3>
                                <p>Start adding tags to your links in your containers to enable cross-searching.</p>
                                <Link to="/dashboard" className="btn-primary mt-6">Go to Dashboard</Link>
                            </div>
                        ) : (
                            <div className="empty-selection-state">
                                <Tag size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
                                <h3>Select a tag to see links</h3>
                                <p>Choose a tag from the sidebar to view all associated links across your library.</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Tags;
