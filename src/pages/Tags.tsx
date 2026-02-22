import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useContainer } from '../contexts/ContainerContext';
import {
    Settings,
    Search,
    Tag,
    ArrowLeft,
    ExternalLink,
    ChevronRight,
    Pin
} from 'lucide-react';
import blinkLogo from '../assets/blinklogo2.png';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import SEO from '../components/SEO';

const Tags: React.FC = () => {
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const { containers, loading } = useContainer();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    if (loading) {
        return <LoadingSkeleton variant="fullscreen" />;
    }

    // Extract all unique tags
    const allLinks = containers.flatMap(container =>
        container.links.map(link => ({ ...link, containerName: container.name, containerId: container.id, containerColor: container.color }))
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
            <SEO title={t('tags.title')} description={t('tags.description')} />
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
                            <Link to="/settings" className="theme-toggle" title={t('dashboard.tooltips.settings')}>
                                <Settings className="h-5 w-5" />
                            </Link>
                            <div className="user-avatar">
                                {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container">
                <div className="container-header">
                    <h2 className="container-name-title">{t('tags.title')}</h2>
                    <p className="container-description-text">{t('tags.description')}</p>

                    <div className="modern-search-bar search-tags-wrapper">
                        <Search className="modern-search-icon" size={18} />
                        <input
                            type="text"
                            placeholder={t('tags.placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="modern-search-input"
                        />
                    </div>
                </div>

                <div className="tags-explorer-layout">
                    {/* Tags Sidebar */}
                    <aside className="tags-sidebar fade-in">
                        <div className="sidebar-header">
                            <Tag size={18} />
                            <h3>{t('tags.sidebar.title', { count: uniqueTags.length })}</h3>
                        </div>
                        <div className="sidebar-tags-list">
                            {filteredTags.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    <p>{t('tags.sidebar.empty')}</p>
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
                    <section className="tags-content fade-in">
                        {selectedTag ? (
                            <>
                                <div className="content-header">
                                    <h3>{t('tags.content.taggedWith')} <span className="text-primary">#{selectedTag}</span></h3>
                                    <span className="links-count">{t('tags.content.items', { count: displayedLinks.length })}</span>
                                </div>
                                <div className="tags-links-grid">
                                    {displayedLinks.map(link => (
                                        <div key={link.id + link.containerId} className="tag-link-card">
                                            <div className="card-top">
                                                <div className="container-indicator" style={{ backgroundColor: link.containerColor || '#6366f1' }}>
                                                    {link.containerName}
                                                </div>
                                                <div className="tag-link-title-group">
                                                    <h4 className="tag-link-card-title">{link.title}</h4>
                                                    {link.isPinned && <Pin size={14} className="tag-pinned-icon" fill="currentColor" />}
                                                </div>
                                            </div>
                                            {link.description && (
                                                <p className="tag-link-description">
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
                                                    to={`/container/${link.containerId}`}
                                                    className="view-container-link"
                                                    title={t('tags.content.openContainer')}
                                                >
                                                    {t('tags.content.openContainer')}
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : uniqueTags.length === 0 ? (
                            <EmptyState
                                type="tags"
                                title={t('tags.empty.noTags.title')}
                                description={t('tags.empty.noTags.desc')}
                                action={
                                    <Link to="/dashboard" className="btn-primary go-to-dashboard-btn" style={{ textDecoration: 'none' }}>
                                        {t('tags.empty.button')}
                                    </Link>
                                }
                            />
                        ) : (
                            <EmptyState
                                type="search"
                                title={t('tags.empty.noSelection.title')}
                                description={t('tags.empty.noSelection.desc')}
                            />
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Tags;
