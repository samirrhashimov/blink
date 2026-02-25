import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContainer } from '../contexts/ContainerContext';
import { useAuth } from '../contexts/AuthContext';
import {
    Search,
    X,
    Link as LinkIcon,
    FolderOpen,
    Tag,
    ArrowRight,
    Command
} from 'lucide-react';

interface SearchResult {
    type: 'link' | 'container';
    title: string;
    subtitle: string;
    url?: string;
    containerId: string;
    containerName: string;
    containerColor: string;
    linkId?: string;
    favicon?: string;
    tags?: string[];
    matchField: string; // which field matched
}

const SpotlightSearch: React.FC = () => {
    const { currentUser } = useAuth();
    const { containers } = useContainer();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const colors = ['#6366f1', '#10b981', '#f43f5e', '#d97706', '#8b5cf6', '#3b82f6', '#0891b2', '#ea580c', '#6d28d9', '#be185d'];

    const getContainerColor = (container: { id: string; color?: string }) =>
        container.color || colors[container.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length];

    // Global keyboard listener for Super+F
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Super+F (metaKey+F) or Ctrl+K to open spotlight
            if ((e.metaKey && e.key === 'f') || (e.ctrlKey && e.key === 'k')) {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(true);
            }

            // Escape to close
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
                setQuery('');
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [isOpen]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Search through all containers and links
    const results = useMemo<SearchResult[]>(() => {
        if (!query.trim() || query.length < 2) return [];

        const q = query.toLowerCase();
        const found: SearchResult[] = [];

        containers.forEach(container => {
            const containerColor = getContainerColor(container);

            // Match container name or description
            if (container.name.toLowerCase().includes(q) ||
                container.description?.toLowerCase().includes(q)) {
                found.push({
                    type: 'container',
                    title: container.name,
                    subtitle: container.description || `${container.links.length} links`,
                    containerId: container.id,
                    containerName: container.name,
                    containerColor,
                    matchField: container.name.toLowerCase().includes(q) ? 'name' : 'description'
                });
            }

            // Match links
            container.links.forEach(link => {
                const titleMatch = link.title.toLowerCase().includes(q);
                const urlMatch = link.url.toLowerCase().includes(q);
                const descMatch = link.description?.toLowerCase().includes(q);
                const tagMatch = link.tags?.some(tag => tag.toLowerCase().includes(q));

                if (titleMatch || urlMatch || descMatch || tagMatch) {
                    let matchField = 'title';
                    if (!titleMatch && urlMatch) matchField = 'url';
                    if (!titleMatch && !urlMatch && descMatch) matchField = 'description';
                    if (!titleMatch && !urlMatch && !descMatch && tagMatch) matchField = 'tag';

                    found.push({
                        type: 'link',
                        title: link.title,
                        subtitle: link.url,
                        url: link.url,
                        containerId: container.id,
                        containerName: container.name,
                        containerColor,
                        linkId: link.id,
                        favicon: link.favicon,
                        tags: link.tags,
                        matchField
                    });
                }
            });
        });

        // Sort: exact title matches first, then containers, then links
        found.sort((a, b) => {
            // Exact title matches first
            const aExact = a.title.toLowerCase() === q ? -1 : 0;
            const bExact = b.title.toLowerCase() === q ? -1 : 0;
            if (aExact !== bExact) return aExact - bExact;

            // Containers before links
            if (a.type !== b.type) return a.type === 'container' ? -1 : 1;

            return 0;
        });

        return found.slice(0, 15); // Limit to 15 results
    }, [query, containers]);

    // Keyboard navigation within results
    useEffect(() => {
        if (!isOpen) return;

        const handleNav = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && results[selectedIndex]) {
                e.preventDefault();
                handleSelect(results[selectedIndex]);
            }
        };

        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, results, selectedIndex]);

    // Scroll selected item into view
    useEffect(() => {
        const selected = resultsRef.current?.querySelector('.spotlight-result-item.selected');
        selected?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    // Reset selection when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const handleSelect = (result: SearchResult) => {
        setIsOpen(false);
        setQuery('');
        navigate(`/container/${result.containerId}`);
    };

    const handleClose = () => {
        setIsOpen(false);
        setQuery('');
    };

    // Highlight matched text
    const highlightMatch = (text: string, q: string) => {
        if (!q.trim()) return text;
        const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? <mark key={i} className="spotlight-highlight">{part}</mark> : part
        );
    };

    if (!currentUser || !isOpen) return null;

    return (
        <div className="spotlight-overlay" onClick={handleClose}>
            <div className="spotlight-container" onClick={e => e.stopPropagation()}>
                {/* Search Input */}
                <div className="spotlight-input-wrapper">
                    <Search className="spotlight-input-icon" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        className="spotlight-input"
                        placeholder="Search links, containers, tags..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                    />
                    {query && (
                        <button className="spotlight-clear" onClick={() => setQuery('')}>
                            <X size={16} />
                        </button>
                    )}
                    <kbd className="spotlight-kbd">ESC</kbd>
                </div>

                {/* Results */}
                {query.length >= 2 && (
                    <div className="spotlight-results" ref={resultsRef}>
                        {results.length === 0 ? (
                            <div className="spotlight-empty">
                                <Search size={32} strokeWidth={1.5} />
                                <p>No results found for "{query}"</p>
                                <span>Try searching with different keywords</span>
                            </div>
                        ) : (
                            <>
                                <div className="spotlight-results-count">
                                    {results.length} result{results.length !== 1 ? 's' : ''}
                                </div>
                                {results.map((result, index) => (
                                    <div
                                        key={`${result.containerId}-${result.linkId || 'container'}-${index}`}
                                        className={`spotlight-result-item ${index === selectedIndex ? 'selected' : ''}`}
                                        onClick={() => handleSelect(result)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        {/* Icon / Favicon */}
                                        <div className="spotlight-result-icon">
                                            {result.type === 'container' ? (
                                                <div
                                                    className="spotlight-result-container-icon"
                                                    style={{ backgroundColor: result.containerColor }}
                                                >
                                                    <FolderOpen size={14} />
                                                </div>
                                            ) : result.favicon ? (
                                                <img
                                                    src={result.favicon}
                                                    alt=""
                                                    className="spotlight-result-favicon"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : (
                                                <div className="spotlight-result-link-icon">
                                                    <LinkIcon size={14} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="spotlight-result-content">
                                            <div className="spotlight-result-title">
                                                {highlightMatch(result.title, query)}
                                            </div>
                                            <div className="spotlight-result-subtitle">
                                                {result.type === 'link' && (
                                                    <span
                                                        className="spotlight-result-badge"
                                                        style={{
                                                            backgroundColor: `${result.containerColor}22`,
                                                            color: result.containerColor,
                                                            borderColor: `${result.containerColor}33`
                                                        }}
                                                    >
                                                        {result.containerName}
                                                    </span>
                                                )}
                                                {result.matchField === 'tag' && result.tags && (
                                                    <span className="spotlight-result-tags">
                                                        <Tag size={10} />
                                                        {result.tags
                                                            .filter(t => t.toLowerCase().includes(query.toLowerCase()))
                                                            .slice(0, 2)
                                                            .map((tag, i) => (
                                                                <span key={i} className="spotlight-result-tag">{tag}</span>
                                                            ))}
                                                    </span>
                                                )}
                                                {result.matchField === 'description' && result.type === 'container' ? (
                                                    <span className="spotlight-result-desc">
                                                        {highlightMatch(result.subtitle, query)}
                                                    </span>
                                                ) : result.type === 'link' ? (
                                                    <span className="spotlight-result-url">
                                                        {highlightMatch(result.subtitle, query)}
                                                    </span>
                                                ) : (
                                                    <span className="spotlight-result-desc">
                                                        {result.subtitle}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <ArrowRight size={14} className="spotlight-result-arrow" />
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* Footer hint */}
                {query.length < 2 && (
                    <div className="spotlight-footer">
                        <div className="spotlight-footer-hints">
                            <span><kbd>↑</kbd> <kbd>↓</kbd> navigate</span>
                            <span><kbd>↵</kbd> open</span>
                            <span><kbd>esc</kbd> close</span>
                        </div>
                        <div className="spotlight-footer-shortcut">
                            <Command size={12} />
                            <span>+ F to open anytime</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpotlightSearch;
