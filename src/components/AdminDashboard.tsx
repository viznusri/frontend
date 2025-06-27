import React, { useState, useEffect } from 'react';
import { dashboard, DashboardAnalytics } from '../services/api';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ClipLoader } from 'react-spinners';
import { format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await dashboard.getAnalytics();
      setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const behaviorTypeLabels: Record<string, string> = {
    payment_on_time: 'On-time Payments',
    payment_late: 'Late Payments',
    credit_utilization_low: 'Low Credit Use',
    credit_utilization_high: 'High Credit Use',
    new_credit_account: 'New Accounts',
    credit_check: 'Credit Checks'
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <ClipLoader size={50} color="#6366f1" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="admin-dashboard">
        <div className="error-state">
          <h3>Unable to load analytics</h3>
          <button onClick={fetchAnalytics}>Try Again</button>
        </div>
      </div>
    );
  }

  const pieData = analytics.behaviorStats.map(stat => ({
    name: behaviorTypeLabels[stat._id] || stat._id,
    value: stat.count
  }));

  const activityData = analytics.recentActivity.map(activity => ({
    date: format(new Date(activity._id), 'MMM dd'),
    behaviors: activity.count,
    karma: activity.karmaChange
  }));

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Analytics Dashboard</h1>
          <p className="dashboard-subtitle">Monitor user engagement and karma distribution</p>
        </div>
        <button className="refresh-btn" onClick={fetchAnalytics}>
          <i className="refresh-icon fas fa-sync-alt"></i>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-icon users">
            <i className="fas fa-users fa-lg"></i>
          </div>
          <div className="card-content">
            <h3>Total Users</h3>
            <p className="card-value">{analytics.summary.totalUsers}</p>
            <span className="card-label">Registered users</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon karma">
            <i className="fas fa-star fa-lg"></i>
          </div>
          <div className="card-content">
            <h3>Average Karma</h3>
            <p className="card-value">{analytics.summary.avgKarmaScore}</p>
            <span className="card-label">Points per user</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon growth">
            <i className="fas fa-chart-line fa-lg"></i>
          </div>
          <div className="card-content">
            <h3>Karma Growth</h3>
            <p className="card-value">+{Math.round(analytics.recentActivity.reduce((sum, day) => sum + day.karmaChange, 0) / analytics.recentActivity.length)}%</p>
            <span className="card-label">Daily average</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon engagement">
            <i className="fas fa-smile fa-lg"></i>
          </div>
          <div className="card-content">
            <h3>User Engagement</h3>
            <p className="card-value">{Math.round((analytics.topPerformers.length / analytics.summary.totalUsers) * 100)}%</p>
            <span className="card-label">Active this month</span>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          {/* Charts Row */}
          <div className="charts-row">
            <div className="chart-card">
              <h3>Behavior Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Karma Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.karmaDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="range" tick={{ fill: '#64748b' }} />
                  <YAxis tick={{ fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]}>
                    {analytics.karmaDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="chart-card full-width">
            <h3>Recent Activity (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                <XAxis dataKey="date" tick={{ fill: '#64748b' }} />
                <YAxis yAxisId="left" tick={{ fill: '#64748b' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="behaviors" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  dot={{ fill: '#6366f1' }}
                  name="Behaviors"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="karma" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                  name="Karma Change"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Performers */}
          <div className="top-performers">
            <h3>Top Performers (Last 30 Days)</h3>
            <div className="performers-list">
              {analytics.topPerformers.map((performer, index) => (
                <div key={index} className="performer-card">
                  <div className="performer-rank">
                    {index === 0 && '🏆'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </div>
                  <div className="performer-info">
                    <h4>{performer.username}</h4>
                    <p>+{performer.karmaGained} karma from {performer.behaviorCount} behaviors</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="tab-content">
          <div className="users-table-container">
            <h3>All Users Leaderboard</h3>
            <div className="table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Karma Score</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.leaderboard.map((user, index) => (
                    <tr key={user._id} className={index < 3 ? 'top-user' : ''}>
                      <td className="rank-cell">
                        {index === 0 && <span className="medal">🥇</span>}
                        {index === 1 && <span className="medal">🥈</span>}
                        {index === 2 && <span className="medal">🥉</span>}
                        {index > 2 && `#${index + 1}`}
                      </td>
                      <td className="username-cell">
                        <div className="user-avatar">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        {user.username}
                      </td>
                      <td>{user.email}</td>
                      <td className="karma-cell">
                        <span className="karma-value">{user.karmaScore}</span>
                      </td>
                      <td>{format(new Date(user.createdAt), 'MMM dd, yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;