import React from 'react';
import { X, TrendingUp, Calendar, MousePointer2 } from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import type { Link } from '../types';

interface LinkStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    link: Link;
    vaultColor?: string;
}

const LinkStatsModal: React.FC<LinkStatsModalProps> = ({
    isOpen,
    onClose,
    link,
    vaultColor = '#6366f1'
}) => {
    if (!isOpen) return null;

    // Prepare data for the chart
    const stats = link.clickStats || {};
    const sortedDates = Object.keys(stats).sort();

    let chartData = [];
    if (sortedDates.length === 0) {
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            chartData.push({
                date: date.toISOString().split('T')[0],
                clicks: 0
            });
        }
    } else {
        const startDate = new Date(sortedDates[0]);
        const endDate = new Date();
        const current = new Date(startDate);

        while (current <= endDate) {
            const dateStr = current.toISOString().split('T')[0];
            chartData.push({
                date: dateStr,
                clicks: stats[dateStr] || 0
            });
            current.setDate(current.getDate() + 1);
        }
    }

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
                            style={{ backgroundColor: `${vaultColor}15`, color: vaultColor }}
                        >
                            {link.favicon ? (
                                <img src={link.favicon} alt="" className="header-favicon-img" />
                            ) : (
                                <TrendingUp size={24} />
                            )}
                        </div>
                        <div className="header-titles">
                            <h2>{link.title}</h2>
                            <span>Link Analytics</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="header-close-btn" aria-label="Close modal">
                        <X size={24} />
                    </button>
                </header>

                <div className="stats-cards-row">
                    <div className="premium-stat-card">
                        <div className="stat-card-icon" style={{ color: vaultColor, background: `${vaultColor}10` }}>
                            <MousePointer2 size={20} />
                        </div>
                        <div className="stat-card-data">
                            <span className="stat-card-label">Total Clicks</span>
                            <span className="stat-card-number">{link.clicks || 0}</span>
                        </div>
                    </div>
                    <div className="premium-stat-card">
                        <div className="stat-card-icon stat-icon-green">
                            <Calendar size={20} />
                        </div>
                        <div className="stat-card-data">
                            <span className="stat-card-label">Active Days</span>
                            <span className="stat-card-number">{Object.keys(stats).length}</span>
                        </div>
                    </div>
                </div>

                <div className="premium-chart-area">
                    <h3 className="chart-section-title">Click History</h3>
                    <div className="chart-wrapper-inner">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="premiumColorClicks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={vaultColor} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={vaultColor} stopOpacity={0} />
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
                                    itemStyle={{ color: vaultColor, fontWeight: '600' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="clicks"
                                    stroke={vaultColor}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#premiumColorClicks)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinkStatsModal;
