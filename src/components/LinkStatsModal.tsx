import React from 'react';
import { X, TrendingUp, Clock, MousePointer2, Eye, Download, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import type { Link } from '../types';

interface LinkStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    link: Link;
    containerColor?: string;
}

const LinkStatsModal: React.FC<LinkStatsModalProps> = ({
    isOpen,
    onClose,
    link,
    containerColor = '#6366f1'
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { currentUser } = useAuth();
    const userPlan = currentUser?.plan || 'starter';

    if (!isOpen) return null;

    const isText = link.type === 'text';
    const isFile = link.type === 'file';
    const lifetimeLabel = isFile ? t('container.modals.linkStats.lifetimeFile', 'Lifetime Downloads') : isText ? t('container.modals.linkStats.lifetimeText') : t('container.modals.linkStats.lifetime');
    const todayLabel = isFile ? t('container.modals.linkStats.todayFile', 'Today') : isText ? t('container.modals.linkStats.todayText') : t('container.modals.linkStats.today');
    const historyHeader = isFile ? t('container.modals.linkStats.historyFile', 'Download history') : isText ? t('container.modals.linkStats.historyText') : t('container.modals.linkStats.history');
    const analyticsHeader = isFile ? t('container.modals.linkStats.analyticsFile', 'File Analytics') : isText ? t('container.modals.linkStats.analyticsText') : t('container.modals.linkStats.analytics');
    const shortLabel = isFile ? t('container.modals.linkStats.downloadsShort', 'Downloads') : isText ? t('container.modals.linkStats.viewsShort') : t('container.modals.linkStats.clicksShort');

    // --- PLAN BASED LIMITS ---
    let limitDays = 7;
    if (userPlan === 'pro') limitDays = 90;
    if (userPlan === 'pro+') limitDays = 3650; // Effectively unlimited

    // Prepare data for the chart
    const stats = link.clickStats || {};
    const today = new Date().toISOString().split('T')[0];
    const clicksToday = stats[today] || 0;

    let chartData = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (limitDays - 1));

    let current = new Date(startDate);
    while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0];
        chartData.push({
            date: dateStr,
            clicks: stats[dateStr] || 0
        });
        current.setDate(current.getDate() + 1);
    }

    // --- ADVANCED STATS (PRO+) ---
    const getAdvancedData = (key: 'countries' | 'devices' | 'browsers') => {
        const aggregated: Record<string, number> = {};
        const dStats = link.detailedStats || {};
        
        // Filter detailed stats within plan limit dates
        Object.keys(dStats).forEach(date => {
            if (date >= startDate.toISOString().split('T')[0]) {
                const dayData = dStats[date][key] || {};
                Object.keys(dayData).forEach(item => {
                    aggregated[item] = (aggregated[item] || 0) + dayData[item];
                });
            }
        });

        return Object.keys(aggregated).map(name => ({ name, value: aggregated[name] })).sort((a,b) => b.value - a.value).slice(0, 5);
    };

    const countryData = getAdvancedData('countries');
    const deviceData = getAdvancedData('devices');
    const COLORS = [containerColor, '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    // --- EXPORT LOGIC ---
    const handleExport = () => {
        if (userPlan === 'starter') return;
        
        const headers = ['Date', 'Clicks'];
        const rows = chartData.map(d => [d.date, d.clicks]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const linkElem = document.createElement("a");
        linkElem.setAttribute("href", encodedUri);
        linkElem.setAttribute("download", `stats_${link.title}_${today}.csv`);
        document.body.appendChild(linkElem);
        linkElem.click();
        document.body.removeChild(linkElem);
    };

    const formatXAxis = (tickItem: string) => {
        const date = new Date(tickItem);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="premium-stats-modal" onClick={(e) => e.stopPropagation()}>
                <header className="premium-stats-header">
                    <div className="header-info">
                        <div
                            className="header-icon-box"
                            style={{ backgroundColor: `${containerColor}15`, color: containerColor }}
                        >
                            {link.favicon ? (
                                <img src={link.favicon} alt="" className="header-favicon-img" />
                            ) : (
                                <TrendingUp size={24} />
                            )}
                        </div>
                        <div className="header-titles">
                            <h2>{link.title}</h2>
                            <span>{analyticsHeader}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="header-close-btn" aria-label="Close modal">
                        <X size={24} />
                    </button>
                </header>

                <div className="stats-cards-row">
                    <div className="premium-stat-card">
                        <div className="stat-card-icon" style={{ color: containerColor, background: `${containerColor}10` }}>
                            {isFile ? <Download size={24} /> : isText ? <Eye size={24} /> : <MousePointer2 size={24} />}
                        </div>
                        <div className="stat-card-data">
                            <span className="stat-card-label">{lifetimeLabel}</span>
                            <span className="stat-card-number">{link.clicks || 0}</span>
                        </div>
                    </div>
                    <div className="premium-stat-card today-highlight">
                        <div className="stat-card-icon stat-icon-blue">
                            <Clock size={24} />
                        </div>
                        <div className="stat-card-data">
                            <span className="stat-card-label">{todayLabel}</span>
                            <span className="stat-card-number">{clicksToday}</span>
                        </div>
                    </div>
                </div>

                <div className="premium-chart-area">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 className="chart-section-title" style={{ margin: 0 }}>{historyHeader} ({limitDays} {t('plans.paywall.days', 'days')})</h3>
                        {userPlan !== 'starter' && (
                            <button onClick={handleExport} className="export-btn-stats">
                                <Download size={14} />
                                {t('common.export', 'Export')}
                            </button>
                        )}
                    </div>
                    <div className="chart-wrapper-inner">
                        {/* CHART CONTENT ... */}
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="premiumColorClicks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={containerColor} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={containerColor} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatXAxis}
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                                        backgroundColor: '#1e293b',
                                        color: '#f1f5f9',
                                        padding: '8px 12px'
                                    }}
                                    itemStyle={{ color: containerColor, fontWeight: '600' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="clicks"
                                    name={shortLabel}
                                    stroke={containerColor}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#premiumColorClicks)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {userPlan === 'pro+' && (
                    <div className="advanced-analytics-grid">
                        <div className="advanced-chart-box">
                            <h4>{t('plans.paywall.countries', 'Countries')}</h4>
                            <div style={{ height: '200px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={countryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {countryData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mini-legend">
                                {countryData.map((d, i) => (
                                    <div key={d.name} className="legend-item">
                                        <span className="dot" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="name">{d.name}</span>
                                        <span className="val">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="advanced-chart-box">
                            <h4>{t('plans.paywall.devices', 'Devices')}</h4>
                            <div style={{ height: '200px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={deviceData} layout="vertical" margin={{ left: -20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={70} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {deviceData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
                
                {userPlan === 'starter' && (
                    <div className="starter-limit-banner" onClick={() => navigate('/paywall')}>
                        <span>{t('plans.paywall.limitNote', 'Upgrade to Pro to see up to 90 days of history')}</span>
                        <Zap size={14} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinkStatsModal;
