import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ProfileService } from '../services/profileService';
import type { User, Container } from '../types';
import { ArrowLeft, UserPlus, UserMinus, ExternalLink, X, Share2, Flag } from 'lucide-react';
import blinkLogo from '../assets/blinklogo2.png';
import SEO from '../components/SEO';
import SupportButton from '../components/SupportButton';

const Profile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { currentUser } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useToast();

    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [publicContainers, setPublicContainers] = useState<Container[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);
    const [followList, setFollowList] = useState<User[]>([]);
    const [listLoading, setListLoading] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [otherReasonText, setOtherReasonText] = useState<string>('');
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const captchaRef = React.useRef<HTMLDivElement>(null);
    const captchaWidgetId = React.useRef<number | null>(null);

    useEffect(() => {
        if (!username) return;
        loadProfile(username);
    }, [username]);

    const fetchFollowData = async (uid: string) => {
        try {
            if (currentUser) {
                const following = await ProfileService.isFollowing(currentUser.uid, uid);
                setIsFollowing(following);
            }
            const followers = await ProfileService.getFollowerCount(uid);
            const followingList = await ProfileService.getFollowingCount(uid);
            setFollowerCount(followers);
            setFollowingCount(followingList);
        } catch (err) {
            console.error('Error fetching follow stats:', err);
        }
    };

    useEffect(() => {
        if (!profileUser) return;
        fetchFollowData(profileUser.uid);
    }, [profileUser, currentUser]);

    const loadProfile = async (uname: string) => {
        setLoading(true);
        setNotFound(false);
        try {
            const user = await ProfileService.getUserByUsername(uname);
            if (!user) {
                setNotFound(true);
                return;
            }
            setProfileUser(user);
            const containers = await ProfileService.getPublicContainers(user.uid);
            setPublicContainers(containers);
        } catch (err) {
            console.error('[Profile] Error loading profile:', err);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!currentUser || !profileUser) return;
        if (currentUser.uid === profileUser.uid) return;

        setFollowLoading(true);
        try {
            if (isFollowing) {
                await ProfileService.unfollowUser(currentUser.uid, profileUser.uid);
                setIsFollowing(false);
                setFollowerCount(c => Math.max(0, c - 1));
            } else {
                await ProfileService.followUser(currentUser.uid, profileUser.uid);
                setIsFollowing(true);
                setFollowerCount(c => c + 1);
            }
            // No longer need to refresh entire UI profile just to update follow count since we don't store arrays
        } catch (err) {
            console.error('[Profile] Follow error:', err);
        } finally {
            setFollowLoading(false);
        }
    };

    const openFollowers = async () => {
        if (!profileUser) return;
        setShowFollowersModal(true);
        setListLoading(true);
        try {
            const users = await ProfileService.getFollowers(profileUser.uid);
            setFollowList(users);
        } catch (err) {
            console.error('Error fetching followers list:', err);
        } finally {
            setListLoading(false);
        }
    };

    const openFollowing = async () => {
        if (!profileUser) return;
        setShowFollowingModal(true);
        setListLoading(true);
        try {
            const users = await ProfileService.getFollowing(profileUser.uid);
            setFollowList(users);
        } catch (err) {
            console.error('Error fetching following list:', err);
        } finally {
            setListLoading(false);
        }
    };

    const closeModals = () => {
        setShowFollowersModal(false);
        setShowFollowingModal(false);
        setFollowList([]);
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: profileUser?.displayName || profileUser?.username || 'Profile',
                    url,
                });
            } catch {
                // user cancelled, do nothing
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                toast.success(t('profile.linkCopied'));
            } catch {
                toast.error(t('profile.linkCopyFailed'));
            }
        }
    };

    const REPORT_REASONS = [
        { key: 'spam',        labelKey: 'profile.reportReasonSpam' },
        { key: 'harassment',  labelKey: 'profile.reportReasonHarassment' },
        { key: 'fake',        labelKey: 'profile.reportReasonFake' },
        { key: 'hate',        labelKey: 'profile.reportReasonHate' },
        { key: 'inappropriate', labelKey: 'profile.reportReasonInappropriate' },
        { key: 'other',      labelKey: 'profile.reportReasonOther' },
    ];

    const handleReport = () => {
        if (!profileUser) return;
        const reportKey = `reported_${profileUser.uid}`;
        if (localStorage.getItem(reportKey)) {
            toast.error(t('profile.alreadyReported'));
            return;
        }
        setSelectedReason('');
        setOtherReasonText('');
        setCaptchaToken(null);
        setShowReportModal(true);
    };

    // Render reCAPTCHA once modal is open
    React.useEffect(() => {
        if (!showReportModal) {
            captchaWidgetId.current = null;
            return;
        }
        const tryRender = () => {
            if (captchaRef.current && (window as any).grecaptcha && captchaWidgetId.current === null) {
                // Clear previous content
                captchaRef.current.innerHTML = '';
                const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
                captchaWidgetId.current = (window as any).grecaptcha.render(captchaRef.current, {
                    sitekey: siteKey,
                    callback: (token: string) => setCaptchaToken(token),
                    'expired-callback': () => setCaptchaToken(null),
                });
            } else {
                setTimeout(tryRender, 300);
            }
        };
        setTimeout(tryRender, 150);
    }, [showReportModal]);

    const submitReport = async () => {
        if (!profileUser) return;
        if (!selectedReason) {
            toast.error(t('profile.reportSelectReason'));
            return;
        }
        if (selectedReason === 'other' && !otherReasonText.trim()) {
            toast.error(t('profile.reportProvideDetails'));
            return;
        }
        if (!captchaToken) {
            toast.error(t('profile.reportCompleteCaptcha'));
            return;
        }
        setReportLoading(true);
        try {
            const now = new Date().toISOString();
            const body = new FormData();
            body.append('_subject', 'Report User');
            body.append('reason', selectedReason === 'other' ? `Other: ${otherReasonText}` : selectedReason);
            body.append('reported_username', profileUser.username || '');
            body.append('reported_email', profileUser.email || '');
            body.append('reported_uid', profileUser.uid);
            body.append('reported_display_name', profileUser.displayName || '');
            body.append('reported_at', now);
            body.append('g-recaptcha-response', captchaToken);
            if (currentUser) {
                body.append('reporter_uid', currentUser.uid);
                body.append('reporter_email', currentUser.email || '');
                body.append('reporter_username', (currentUser as any).username || '');
            }
            const res = await fetch('https://formspree.io/f/xaqpaqky', {
                method: 'POST',
                body,
                headers: { Accept: 'application/json' },
            });
            if (res.ok) {
                const reportKey = `reported_${profileUser.uid}`;
                localStorage.setItem(reportKey, now);
                setShowReportModal(false);
                toast.success(t('profile.reportSent'));
            } else {
                toast.error(t('profile.reportFailed'));
            }
        } catch {
            toast.error(t('profile.reportFailed'));
        } finally {
            setReportLoading(false);
        }
    };

    const isOwnProfile = currentUser?.uid === profileUser?.uid;

    const colors = ['#6366f1', '#10b981', '#f43f5e', '#d97706', '#8b5cf6', '#3b82f6', '#0891b2', '#ea580c'];
    const getContainerColor = (container: Container) =>
        container.color || colors[container.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length];

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    <div className="profile-loading-spinner" />
                </div>
            </div>
        );
    }

    if (notFound || !profileUser) {
        return (
            <div className="profile-page">
                <SEO title={t('profile.notFound')} description="" />
                <header className="header">
                    <div className="container">
                        <div className="header-content">
                            <div className="header-left">
                                <button onClick={() => navigate(-1)} className="back-link">
                                    <ArrowLeft />
                                </button>
                                <img src={blinkLogo} alt="Blink" className="logo-image" style={{ height: '40px', width: 'auto', marginLeft: '1rem' }} />
                            </div>
                        </div>
                    </div>
                </header>
                <main className="container fade-in">
                    <div className="profile-not-found">
                        <div className="profile-not-found-icon">👤</div>
                        <h2>{t('profile.notFound')}</h2>
                        <p>{t('profile.notFoundDesc')}</p>
                        <Link to="/dashboard" className="btn-primary">{t('profile.goHome')}</Link>
                    </div>
                </main>
            </div>
        );
    }

    const displayName = profileUser.displayName || profileUser.username || 'User';
    const uname = profileUser.username ? `@${profileUser.username}` : '';

    return (
        <div className="profile-page">
            <SEO
                title={`${profileUser.username}`}
                description={`${displayName}'s public profile on Blink`}
            />

            {/* Header */}
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <div className="header-left">
                            <button onClick={() => navigate(-1)} className="back-link">
                                <ArrowLeft />
                            </button>
                            <img src={blinkLogo} alt="Blink" className="logo-image" style={{ height: '40px', width: 'auto', marginLeft: '1rem' }} />
                        </div>
                        <div className="header-right">
                            <div className="hidden md:flex">
                                <SupportButton />
                            </div>
                            {currentUser ? (
                                <Link to={currentUser.username ? `/profile/${currentUser.username}` : '#'} className="user-avatar-link">
                                    <div className="user-avatar" style={{ backgroundImage: currentUser.photoURL ? `url(${currentUser.photoURL})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden' }}>
                                        {!currentUser.photoURL && (currentUser.displayName?.charAt(0).toUpperCase() || 'U')}
                                    </div>
                                </Link>
                            ) : (
                                <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                    {t('landing.login')}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Profile Hero */}
            <main className="container fade-in">
                <div className="profile-hero">
                    {/* Avatar */}
                    <div className="profile-avatar-wrap">
                        {profileUser.photoURL ? (
                            <img
                                src={profileUser.photoURL}
                                alt={displayName}
                                className="profile-avatar-img"
                            />
                        ) : (
                            <div className="profile-avatar-placeholder">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="profile-info">
                        <div className="profile-name-row">
                            <h1 className="profile-display-name">{displayName}</h1>
                            <div className="profile-desktop-actions">
                                {isOwnProfile ? (
                                    <Link to="/settings" className="btn-secondary profile-action-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                                        {t('profile.editProfile')}
                                    </Link>
                                ) : currentUser ? (
                                    <button
                                        onClick={handleFollow}
                                        disabled={followLoading}
                                        className={isFollowing ? 'btn-secondary profile-action-btn' : 'btn-primary profile-action-btn'}
                                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                                    >
                                        {followLoading ? (
                                            t('common.processing')
                                        ) : isFollowing ? (
                                            <><UserMinus size={16} style={{ marginRight: '0.4rem' }} />{t('profile.unfollow')}</>
                                        ) : (
                                            <><UserPlus size={16} style={{ marginRight: '0.4rem' }} />{t('profile.follow')}</>
                                        )}
                                    </button>
                                ) : (
                                    <Link to="/login" className="btn-primary profile-action-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                                        <UserPlus size={16} style={{ marginRight: '0.4rem' }} />
                                        {t('profile.followToLogin')}
                                    </Link>
                                )}
                                <button
                                    onClick={handleShare}
                                    className="profile-icon-btn"
                                    title={t('profile.shareProfile')}
                                    aria-label={t('profile.shareProfile')}
                                >
                                    <Share2 size={17} />
                                </button>
                                {!isOwnProfile && currentUser && (
                                    <button
                                        onClick={handleReport}
                                        disabled={reportLoading}
                                        className="profile-icon-btn profile-report-btn"
                                        title={t('profile.reportUser')}
                                        aria-label={t('profile.reportUser')}
                                    >
                                        <Flag size={17} />
                                    </button>
                                )}
                            </div>
                        </div>
                        {uname && <p className="profile-username">{uname}</p>}

                        {/* Stats */}
                        <div className="profile-stats">
                            <div className="profile-stat is-clickable" onClick={openFollowers}>
                                <span className="profile-stat-num">{followerCount}</span>
                                <span className="profile-stat-label">{t('profile.followers')}</span>
                            </div>
                            <div className="profile-stat-divider" />
                            <div className="profile-stat is-clickable" onClick={openFollowing}>
                                <span className="profile-stat-num">{followingCount}</span>
                                <span className="profile-stat-label">{t('profile.following')}</span>
                            </div>
                            <div className="profile-stat-divider" />
                            <div className="profile-stat">
                                <span className="profile-stat-num">{publicContainers.length}</span>
                                <span className="profile-stat-label">{t('profile.publicContainers')}</span>
                            </div>
                        </div>

                        {/* Mobile Actions - shown only on mobile */}
                        <div className="profile-mobile-actions">
                            {isOwnProfile ? (
                                <Link to="/settings" className="btn-secondary profile-action-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                                    {t('profile.editProfile')}
                                </Link>
                            ) : currentUser ? (
                                <button
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                    className={isFollowing ? 'btn-secondary profile-action-btn' : 'btn-primary profile-action-btn'}
                                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                                >
                                    {followLoading ? (
                                        t('common.processing')
                                    ) : isFollowing ? (
                                        <><UserMinus size={16} style={{ marginRight: '0.4rem' }} />{t('profile.unfollow')}</>
                                    ) : (
                                        <><UserPlus size={16} style={{ marginRight: '0.4rem' }} />{t('profile.follow')}</>
                                    )}
                                </button>
                            ) : (
                                <Link to="/login" className="btn-primary profile-action-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                                    <UserPlus size={16} style={{ marginRight: '0.4rem' }} />
                                    {t('profile.followToLogin')}
                                </Link>
                            )}
                            <button
                                onClick={handleShare}
                                className="profile-icon-btn"
                                title={t('profile.shareProfile')}
                                aria-label={t('profile.shareProfile')}
                            >
                                <Share2 size={17} />
                            </button>
                            {!isOwnProfile && currentUser && (
                                <button
                                    onClick={handleReport}
                                    disabled={reportLoading}
                                    className="profile-icon-btn profile-report-btn"
                                    title={t('profile.reportUser')}
                                    aria-label={t('profile.reportUser')}
                                >
                                    <Flag size={17} />
                                </button>
                            )}
                        </div>

                    </div>
                </div>

                {/* Public Containers */}
                <section className="profile-containers-section fade-in">
                    <div className="profile-section-header">
                        <h2>{t('profile.publicContainersTitle')}</h2>
                    </div>

                    {publicContainers.length === 0 ? (
                        <div className="profile-empty">
                            <p>{t('profile.noPublicContainers')}</p>
                        </div>
                    ) : (
                        <div className="profile-public-grid fade-in">
                            {publicContainers.map(container => {
                                const color = getContainerColor(container);
                                const favicons = container.links
                                    ?.filter(link => link.favicon)
                                    .slice(0, 4)
                                    .map(link => link.favicon!) || [];
                                const linkCount = container.links?.length || 0;

                                return (
                                    <Link
                                        key={container.id}
                                        to={`/container/${container.id}`}
                                        className="container-card profile-public-card hover-lift"
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div className="container-card-overlay" style={{ backgroundColor: color }} />
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
                                                    {container.links && container.links.filter(l => l.favicon).length > 4 && (
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
                                                    <ExternalLink size={12} />
                                                    {linkCount} {t('container.links')}
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
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>

            {/* Follow/Following Modal */}
            {(showFollowersModal || showFollowingModal) && (
                <div className="follow-modal-overlay" onClick={closeModals}>
                    <div className="follow-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="follow-modal-header">
                            <h3>{showFollowersModal ? t('profile.followers') : t('profile.following')}</h3>
                            <button className="follow-modal-close" onClick={closeModals}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="follow-modal-body">
                            {listLoading ? (
                                <div className="follow-list-loading">
                                    <div className="follow-list-spinner" />
                                </div>
                            ) : followList.length === 0 ? (
                                <div className="follow-list-empty">
                                    <p>{showFollowersModal ? t('profile.noFollowers') : t('profile.noFollowing')}</p>
                                </div>
                            ) : (
                                <div className="follow-list">
                                    {followList.map(user => (
                                        <Link
                                            key={user.uid}
                                            to={`/profile/${user.username}`}
                                            className="follow-list-item"
                                            onClick={closeModals}
                                        >
                                            <div className="follow-list-avatar">
                                                {user.photoURL ? (
                                                    <img src={user.photoURL} alt={user.displayName} className="follow-list-avatar" />
                                                ) : (
                                                    user.displayName?.charAt(0).toUpperCase() || 'U'
                                                )}
                                            </div>
                                            <div className="follow-list-info">
                                                <span className="follow-list-name">{user.displayName || user.username}</span>
                                                <span className="follow-list-username">@{user.username}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="follow-modal-overlay" onClick={() => !reportLoading && setShowReportModal(false)}>
                    <div className="follow-modal-content report-modal" onClick={e => e.stopPropagation()}>
                        <div className="follow-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Flag size={18} style={{ color: '#ef4444' }} />
                                <h3 style={{ color: '#ef4444' }}>{t('profile.reportUser')}</h3>
                            </div>
                            <button className="follow-modal-close" onClick={() => setShowReportModal(false)} disabled={reportLoading}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="follow-modal-body report-modal-body">
                            <p className="report-modal-desc">{t('profile.reportModalDesc')}</p>
                            <div className="report-reasons-grid">
                                {REPORT_REASONS.map(r => (
                                    <button
                                        key={r.key}
                                        className={`report-reason-chip${selectedReason === r.key ? ' selected' : ''}`}
                                        onClick={() => setSelectedReason(r.key)}
                                    >
                                        {t(r.labelKey)}
                                    </button>
                                ))}
                            </div>
                            {selectedReason === 'other' && (
                                <textarea
                                    className="report-other-textarea"
                                    placeholder={t('profile.reportOtherPlaceholder')}
                                    value={otherReasonText}
                                    onChange={(e) => setOtherReasonText(e.target.value)}
                                    rows={3}
                                />
                            )}
                            <div className="report-captcha-wrap">
                                <div ref={captchaRef} />
                            </div>
                            <button
                                className="report-submit-btn"
                                onClick={submitReport}
                                disabled={reportLoading || !selectedReason || (selectedReason === 'other' && !otherReasonText.trim()) || !captchaToken}
                            >
                                {reportLoading ? t('common.processing') : t('profile.reportSubmit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;

