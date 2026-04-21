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
  Layers
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
import '../css/Admin.css';

const AdminDashboard: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtering states
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'starter' | 'pro' | 'pro+'>('all');
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
      
      // Plan
      const matchesPlan = planFilter === 'all' || (u.plan || 'starter') === planFilter;
      
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
      
      return matchesSearch && matchesRole && matchesPlan && matchesDate;
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
            <h1>{activeTab === 'overview' ? 'Dashboard Overview' : 'User Management'}</h1>
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
                        <span className="tag-plan">{user.plan || 'starter'}</span>
                        <span className="user-date">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
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
                      <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value as any)}>
                        <option value="all">All Plans</option>
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                        <option value="pro+">Pro+</option>
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
                      <th>Plan</th>
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
                        <td>
                          <span className={`plan-badge ${user.plan || 'starter'}`}>
                            {user.plan || 'starter'}
                          </span>
                        </td>
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
