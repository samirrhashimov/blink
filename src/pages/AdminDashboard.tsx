import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AdminService } from '../services/adminService';
import {
  Users,
  TrendingUp,
  Globe,
  Smartphone,
  ArrowLeft,
  Search,
  ChevronRight,
  ShieldCheck,
  Filter,
  Activity,
  Calendar,
  Layers,
  Megaphone,
  X,
  ExternalLink
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import type { User } from '../types';
import LoadingSkeleton from '../components/LoadingSkeleton';
import SEO from '../components/SEO';
import announcementConfig, { type AnnouncementTheme } from '../config/announcement';
import '../css/Admin.css';
import '../css/AnnouncementAdmin.css';

const THEME_OPTIONS: { id: AnnouncementTheme; label: string; bg: string; dot: string }[] = [
  { id: 'yellow', label: 'Yellow (Default)', bg: '#facc15', dot: '#f59e0b' },
  { id: 'blue', label: 'Blue (Info)', bg: '#38bdf8', dot: '#0284c7' },
  { id: 'green', label: 'Green (Success)', bg: '#34d399', dot: '#059669' },
  { id: 'purple', label: 'Purple (Special)', bg: '#a855f7', dot: '#6366f1' },
  { id: 'red', label: 'Red (Alert)', bg: '#f87171', dot: '#dc2626' },
  { id: 'dark', label: 'Dark (Minimal)', bg: '#1e293b', dot: '#475569' },
];

const AdminDashboard: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'announcement'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Announcement editor state (mirrors announcement config — saved to localStorage for preview)
  const [annEnabled, setAnnEnabled] = useState(announcementConfig.enabled);
  const [annTheme, setAnnTheme] = useState<AnnouncementTheme>(announcementConfig.theme || 'yellow');
  const [annHasDetailPage, setAnnHasDetailPage] = useState(announcementConfig.hasDetailPage ?? true);
  const [annUpdatedAt, setAnnUpdatedAt] = useState(announcementConfig.updatedAt || new Date().toISOString().split('T')[0]);
  const [annTextTr, setAnnTextTr] = useState(announcementConfig.messages?.tr?.text ?? '');
  const [annLabelTr, setAnnLabelTr] = useState(announcementConfig.messages?.tr?.linkLabel ?? '');
  const [annTextEn, setAnnTextEn] = useState(announcementConfig.messages?.en?.text ?? '');
  const [annLabelEn, setAnnLabelEn] = useState(announcementConfig.messages?.en?.linkLabel ?? '');
  const [annUrl, setAnnUrl] = useState(announcementConfig.url ?? '/announcement');
  const [annDetailTitleTr, setAnnDetailTitleTr] = useState(announcementConfig.details?.tr?.title ?? '');
  const [annDetailContentTr, setAnnDetailContentTr] = useState(announcementConfig.details?.tr?.content ?? '');
  const [annDetailTitleEn, setAnnDetailTitleEn] = useState(announcementConfig.details?.en?.title ?? '');
  const [annDetailContentEn, setAnnDetailContentEn] = useState(announcementConfig.details?.en?.content ?? '');
  const [annDismissKey, setAnnDismissKey] = useState(announcementConfig.dismissKey);
  const [annSaved, setAnnSaved] = useState(false);
  const [previewTab, setPreviewTab] = useState<'banner' | 'page'>('banner');
  
  // Filtering states
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadStats();
    }
  }, [currentUser]);

  const loadStats = async () => {
    try {
      const data = await AdminService.getGlobalStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Guard: Only allow admins
  if (authLoading) return <LoadingSkeleton variant="fullscreen" />;
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading || !stats) {
    return <LoadingSkeleton variant="fullscreen" />;
  }

  // Prepare data for charts
  const countryData = Object.entries(stats.countries).map(([name, value]) => ({ name, value }));
  const deviceData = Object.entries(stats.devices).map(([name, value]) => ({ name, value }));
  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#d97706', '#8b5cf6'];

  const getFilteredUsers = () => {
    if (!stats?.allUsers) return [];
    
    return stats.allUsers.filter((u: User) => {
      // Search
      const matchesSearch = 
        u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.username || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      // Role
      const matchesRole = roleFilter === 'all' || (u.role || 'user') === roleFilter;
      
      // Date
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const joinedDate = new Date(u.createdAt);
        const now = new Date();
        if (dateFilter === 'today') {
          matchesDate = joinedDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'week') {
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = joinedDate >= oneWeekAgo;
        } else if (dateFilter === 'month') {
          const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = joinedDate >= oneMonthAgo;
        }
      }
      
      return matchesSearch && matchesRole && matchesDate;
    });
  };

  const filteredUsers = getFilteredUsers();

  return (
    <div className="admin-page">
      <SEO title="Admin Dashboard - Blink" />
      
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <ShieldCheck className="sidebar-logo-icon" />
          <span>Blink Admin</span>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={18} />
            <span>Overview</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>User Management</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'announcement' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcement')}
          >
            <Megaphone size={18} />
            <span>Announcement</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => navigate('/dashboard')} className="back-link">
            <ArrowLeft size={16} />
            Back to App
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-info">
            <h1>{activeTab === 'overview' ? 'Dashboard Overview' : activeTab === 'users' ? 'User Management' : 'Announcement Banner'}</h1>
            <p>Welcome back, {currentUser.displayName}. Here's what's happening today.</p>
          </div>
          
          <div className="admin-user-profile">
            <div className="admin-user-info">
              <span className="admin-user-name">{currentUser.displayName}</span>
              <span className="admin-user-role">System Admin</span>
            </div>
            <div className="admin-avatar">
              {currentUser.photoURL ? <img src={currentUser.photoURL} alt="" /> : currentUser.displayName.charAt(0)}
            </div>
          </div>
        </header>

        <div className="admin-content">
          {activeTab === 'overview' ? (
            <div className="stats-grid animate-fade-in">
              {/* Stat Cards */}
              <div className="stat-card">
                <div className="stat-icon-wrapper users">
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <h3>Total Users</h3>
                  <p className="stat-value">{stats.totalUsers}</p>
                  <p className="stat-subtext">Lifetime growth</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper trend">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-info">
                  <h3>Active (Today)</h3>
                  <p className="stat-value">{stats.activeUsersToday}</p>
                  <p className="stat-subtext">Last 24 hours</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper calendar">
                  <Calendar size={24} />
                </div>
                <div className="stat-info">
                  <h3>New (This Week)</h3>
                  <p className="stat-value">+{stats.newUsersWeek}</p>
                  <p className="stat-subtext">Acquisition</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper layers">
                  <Layers size={24} />
                </div>
                <div className="stat-info">
                  <h3>Conversion</h3>
                  <p className="stat-value">84%</p>
                  <p className="stat-subtext">Retention rate</p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="chart-large">
                <div className="chart-header">
                  <h3>User Demographics (Countries)</h3>
                  <Globe size={18} />
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={countryData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                      />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-small">
                <div className="chart-header">
                  <h3>Device Distribution</h3>
                  <Smartphone size={18} />
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {deviceData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="chart-legend">
                    {deviceData.map((d, i) => (
                      <div key={d.name} className="legend-item">
                        <span className="dot" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                        <span className="name">{d.name}</span>
                        <span className="value">{Math.round(((d.value as number) / stats.totalUsers) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="activity-list">
                <div className="chart-header">
                  <h3>Recent User Signups</h3>
                  <ChevronRight size={18} />
                </div>
                <div className="activity-items">
                  {stats.recentUsers.map((user: User) => (
                    <div key={user.uid} className="activity-item">
                      <div className="user-info-brief">
                        <div className="user-mini-avatar">
                          {user.photoURL ? <img src={user.photoURL} alt="" /> : user.displayName.charAt(0)}
                        </div>
                        <div className="user-text">
                          <p className="user-name">{user.displayName}</p>
                          <p className="user-email">{user.email}</p>
                        </div>
                      </div>
                      <div className="user-meta">
                        <span className="user-date">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'announcement' ? (
            <div className="stats-grid animate-fade-in" style={{ display: 'block' }}>
              <div className="announcement-admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3>Announcement & News Center</h3>
                    <p className="subtitle">Manage the global top banner and the optional announcement details page (<code>/announcement</code>).</p>
                  </div>

                  {/* Master Banner Enable Toggle */}
                  <div className="announcement-toggle-row">
                    <label className="switch">
                      <input type="checkbox" checked={annEnabled} onChange={e => setAnnEnabled(e.target.checked)} />
                      <span className="slider" />
                    </label>
                    <span className="announcement-toggle-label">{annEnabled ? 'Banner Active' : 'Banner Hidden'}</span>
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="announcement-theme-section">
                  <span className="announcement-theme-title">Banner Color Theme</span>
                  <div className="announcement-theme-grid">
                    {THEME_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`announcement-theme-chip ${annTheme === opt.id ? 'active' : ''}`}
                        onClick={() => setAnnTheme(opt.id)}
                        disabled={!annEnabled}
                      >
                        <span className="announcement-theme-dot" style={{ backgroundColor: opt.bg, borderColor: opt.dot }} />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 1: Top Banner Settings */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                    1. Top Navbar Banner (Short Announcement Bar)
                  </h4>
                  <div className="announcement-fields">
                    <div className="announcement-field">
                      <label>Banner Text (TR - Turkish)</label>
                      <input value={annTextTr} onChange={e => setAnnTextTr(e.target.value)} disabled={!annEnabled} placeholder="Blink taşındı..." />
                    </div>
                    <div className="announcement-field">
                      <label>Banner Text (EN - English)</label>
                      <input value={annTextEn} onChange={e => setAnnTextEn(e.target.value)} disabled={!annEnabled} placeholder="Blink has migrated..." />
                    </div>
                    <div className="announcement-field">
                      <label>Link Button Label (TR - Turkish)</label>
                      <input value={annLabelTr} onChange={e => setAnnLabelTr(e.target.value)} disabled={!annEnabled} placeholder="Detayları İncele" />
                    </div>
                    <div className="announcement-field">
                      <label>Link Button Label (EN - English)</label>
                      <input value={annLabelEn} onChange={e => setAnnLabelEn(e.target.value)} disabled={!annEnabled} placeholder="Learn More" />
                    </div>
                    <div className="announcement-field" style={{ gridColumn: 'span 2' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>Target URL (Internal route or external link)</label>
                        {annHasDetailPage && (
                          <button
                            type="button"
                            onClick={() => setAnnUrl('/announcement')}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--primary)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            🔗 Link to internal '/announcement' page
                          </button>
                        )}
                      </div>
                      <input value={annUrl} onChange={e => setAnnUrl(e.target.value)} disabled={!annEnabled} placeholder="/announcement or https://..." />
                      <span className="announcement-field-hint">
                        Use <code>/announcement</code> for the internal details page, or specify an external link.
                      </span>
                    </div>
                    <div className="announcement-field" style={{ gridColumn: 'span 2' }}>
                      <label>Dismiss Memory Key</label>
                      <input value={annDismissKey} onChange={e => setAnnDismissKey(e.target.value)} />
                      <span className="announcement-field-hint">Change this key to re-show the banner to users who previously closed it.</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Dedicated Announcement Page Settings */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={annHasDetailPage}
                          onChange={e => {
                            setAnnHasDetailPage(e.target.checked);
                            if (e.target.checked && (!annUrl || annUrl === '')) {
                              setAnnUrl('/announcement');
                            }
                          }}
                        />
                        <span className="slider" />
                      </label>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                        2. Dedicated Announcement Details Page (<code>/announcement</code>)
                      </h4>
                    </div>

                    {annHasDetailPage && (
                      <button
                        type="button"
                        onClick={() => setAnnUpdatedAt(new Date().toISOString().split('T')[0])}
                        style={{
                          background: 'rgba(var(--primary-rgb, 19, 164, 236), 0.1)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--primary)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        📅 Set Today's Date ({new Date().toISOString().split('T')[0]})
                      </button>
                    )}
                  </div>

                  {annHasDetailPage ? (
                    <div className="announcement-fields">
                      <div className="announcement-field" style={{ gridColumn: 'span 2' }}>
                        <label>Publication / Edit Date (Auto Date: YYYY-MM-DD)</label>
                        <input
                          type="text"
                          value={annUpdatedAt}
                          onChange={e => setAnnUpdatedAt(e.target.value)}
                          placeholder="YYYY-MM-DD"
                        />
                        <span className="announcement-field-hint">
                          Formatted automatically according to the user's language (e.g. 1 Eylül 2026 / September 1, 2026).
                        </span>
                      </div>

                      <div className="announcement-field">
                        <label>Page Title (TR - Turkish)</label>
                        <input
                          value={annDetailTitleTr}
                          onChange={e => setAnnDetailTitleTr(e.target.value)}
                          placeholder="Önemli Duyuru: ..."
                        />
                      </div>
                      <div className="announcement-field">
                        <label>Page Title (EN - English)</label>
                        <input
                          value={annDetailTitleEn}
                          onChange={e => setAnnDetailTitleEn(e.target.value)}
                          placeholder="Important Notice: ..."
                        />
                      </div>

                      <div className="announcement-field" style={{ gridColumn: 'span 2' }}>
                        <label>Page Content (TR - Turkish)</label>
                        <textarea
                          rows={6}
                          value={annDetailContentTr}
                          onChange={e => setAnnDetailContentTr(e.target.value)}
                          placeholder="Write the full announcement text here..."
                          style={{ width: '100%' }}
                        />
                      </div>

                      <div className="announcement-field" style={{ gridColumn: 'span 2' }}>
                        <label>Page Content (EN - English)</label>
                        <textarea
                          rows={6}
                          value={annDetailContentEn}
                          onChange={e => setAnnDetailContentEn(e.target.value)}
                          placeholder="Write the full announcement text here..."
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px dashed var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)'
                    }}>
                      Dedicated announcement page is currently <strong>disabled</strong>. The top banner will function as a standalone notification or point directly to the URL specified above.
                    </div>
                  )}
                </div>

                {/* Section 3: Dual Live Previews */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                    <span className="announcement-theme-title">Live Preview</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('banner')}
                        className={`btn-secondary ${previewTab === 'banner' ? 'active' : ''}`}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          backgroundColor: previewTab === 'banner' ? 'var(--primary)' : 'transparent',
                          color: previewTab === 'banner' ? '#fff' : 'var(--text-secondary)'
                        }}
                      >
                        Navbar Banner Preview
                      </button>
                      {annHasDetailPage && (
                        <button
                          type="button"
                          onClick={() => setPreviewTab('page')}
                          className={`btn-secondary ${previewTab === 'page' ? 'active' : ''}`}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            borderRadius: '6px',
                            backgroundColor: previewTab === 'page' ? 'var(--primary)' : 'transparent',
                            color: previewTab === 'page' ? '#fff' : 'var(--text-secondary)'
                          }}
                        >
                          /announcement Page Preview
                        </button>
                      )}
                    </div>
                  </div>

                  {annEnabled ? (
                    previewTab === 'banner' || !annHasDetailPage ? (
                      <div className="announcement-previews-container">
                        {/* TR Preview */}
                        <div className="announcement-preview-box">
                          <div className="announcement-preview-header">
                            <span>🇹🇷 Turkish Banner Preview</span>
                          </div>
                          <div className={`announcement-preview-bar theme-${annTheme}`}>
                            <span>{annTextTr || '🎉 Announcement text'}</span>
                            {annUrl && annLabelTr && <span style={{ opacity: 0.85 }}>{annLabelTr}</span>}
                            {annUrl && <ExternalLink size={11} style={{ opacity: 0.75, flexShrink: 0 }} />}
                            <div className="preview-x"><X size={10} /></div>
                          </div>
                        </div>

                        {/* EN Preview */}
                        <div className="announcement-preview-box">
                          <div className="announcement-preview-header">
                            <span>🇬🇧 English Banner Preview</span>
                          </div>
                          <div className={`announcement-preview-bar theme-${annTheme}`}>
                            <span>{annTextEn || '🎉 Announcement text'}</span>
                            {annUrl && annLabelEn && <span style={{ opacity: 0.85 }}>{annLabelEn}</span>}
                            {annUrl && <ExternalLink size={11} style={{ opacity: 0.75, flexShrink: 0 }} />}
                            <div className="preview-x"><X size={10} /></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                        {/* TR Page Preview */}
                        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>🇹🇷 /announcement (Turkish)</span>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.75rem 0 0.5rem 0', color: 'var(--text-main)' }}>
                            {annDetailTitleTr || 'Announcement Title'}
                          </h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                            📅 {annUpdatedAt}
                          </p>
                          <div style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: 1.6, opacity: 0.85, color: 'var(--text-main)' }}>
                            {annDetailContentTr || 'Announcement content will appear here...'}
                          </div>
                        </div>

                        {/* EN Page Preview */}
                        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>🇬🇧 /announcement (English)</span>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.75rem 0 0.5rem 0', color: 'var(--text-main)' }}>
                            {annDetailTitleEn || 'Announcement Title'}
                          </h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                            📅 {annUpdatedAt}
                          </p>
                          <div style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: 1.6, opacity: 0.85, color: 'var(--text-main)' }}>
                            {annDetailContentEn || 'Announcement content will appear here...'}
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Banner is disabled — nothing will be shown to users.</div>
                  )}
                </div>

                {/* Save & Copy Action */}
                <div className="announcement-actions" style={{ marginTop: '0.5rem' }}>
                  <button
                    className="announcement-save-btn"
                    onClick={() => {
                      const todayDate = new Date().toISOString().split('T')[0];
                      const cfg = `import { version } from '../../package.json';

export type AnnouncementTheme = 'yellow' | 'blue' | 'green' | 'purple' | 'red' | 'dark';

export interface AnnouncementMessage {
  text: string;
  linkLabel?: string;
}

export interface AnnouncementDetail {
  title: string;
  content: string;
}

export interface AnnouncementConfig {
  enabled: boolean;
  theme: AnnouncementTheme;
  hasDetailPage: boolean;
  updatedAt: string;
  messages: Record<string, AnnouncementMessage>;
  url: string | null;
  details: Record<string, AnnouncementDetail>;
  dismissKey: string;
}

const announcement: AnnouncementConfig = {
  enabled: ${annEnabled},
  theme: '${annTheme}',
  hasDetailPage: ${annHasDetailPage},
  updatedAt: '${todayDate}',

  messages: {
    tr: {
      text: '${annTextTr.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',
      linkLabel: '${annLabelTr.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',
    },
    en: {
      text: '${annTextEn.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',
      linkLabel: '${annLabelEn.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',
    },
  },

  url: ${annUrl ? `'${annUrl}'` : 'null'},

  details: {
    tr: {
      title: '${annDetailTitleTr.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',
      content: \`${annDetailContentTr.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`,
    },
    en: {
      title: '${annDetailTitleEn.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',
      content: \`${annDetailContentEn.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`,
    },
  },

  dismissKey: '${annDismissKey}',
};

export default announcement;
`;
                      navigator.clipboard.writeText(cfg).catch(() => {});
                      setAnnUpdatedAt(todayDate);
                      setAnnSaved(true);
                      setTimeout(() => setAnnSaved(false), 3000);
                    }}
                  >
                    Copy full config to clipboard (Auto Updates Date)
                  </button>
                  {annSaved && <span className="announcement-saved-msg">✓ Copied with today's date! Paste into src/config/announcement.ts</span>}
                </div>

                <p className="announcement-note">
                  ⓘ <strong>How to apply:</strong> Configure the banner and optional detail page. Clicking <strong>"Copy full config to clipboard"</strong> automatically updates the date to <strong>today's date</strong>. Paste the copied code into <code>src/config/announcement.ts</code> and redeploy.
                </p>
              </div>
            </div>
          ) : (
            <div className="admin-users-view animate-fade-in">
              <div className="table-header-box">
                <div className="table-controls">
                  <div className="search-box">
                    <Search size={18} />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="filters-bar">
                    <div className="filter-group">
                      <Filter size={16} />
                      <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}>
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </select>
                    </div>

                    <div className="filter-group">
                      <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as any)}>
                        <option value="all">Joined (All Time)</option>
                        <option value="today">Joined Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>

                    <div className="results-count">
                      {filteredUsers.length} users found
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="users-table-wrapper">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Username</th>
                      <th>Joined</th>
                      <th>Last Active</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user: User) => (
                      <tr key={user.uid}>
                        <td>
                          <div className="table-user">
                            <div className="table-avatar">
                              {user.photoURL ? <img src={user.photoURL} alt="" /> : user.displayName.charAt(0)}
                            </div>
                            <div className="table-user-info">
                              <span className="name">{user.displayName}</span>
                              <span className="email">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>@{user.username || '-'}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}</td>
                        <td>
                          <span className={`role-badge ${user.role || 'user'}`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
