import React, { useEffect, useState } from 'react';
import { behaviors, users } from '../services/api';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { ClipLoader } from 'react-spinners';
import { 
  User, 
  Behavior, 
  BehaviorSummary, 
  BehaviorType,
  PieChartData,
  BarChartData,
  KarmaLevel
} from '../types';

interface KarmaScoreProps {
  userData: User | null;
  behaviors: Behavior[];
}

interface LeaderboardUser {
  _id: string;
  username: string;
  karmaScore: number;
}

const KarmaScore: React.FC<KarmaScoreProps> = ({ userData }) => {
  const [summary, setSummary] = useState<BehaviorSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchSummary(), fetchLeaderboard()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await behaviors.getSummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await users.getLeaderboard();
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const getKarmaLevel = (score: number): KarmaLevel => {
    if (score >= 500) return { level: 'Platinum', color: '#8b5cf6', next: null, needed: 0 };
    if (score >= 250) return { level: 'Gold', color: '#f59e0b', next: 'Platinum', needed: 500 - score };
    if (score >= 100) return { level: 'Silver', color: '#6b7280', next: 'Gold', needed: 250 - score };
    if (score >= 50) return { level: 'Bronze', color: '#a16207', next: 'Silver', needed: 100 - score };
    return { level: 'Starter', color: '#94a3b8', next: 'Bronze', needed: 50 - score };
  };

  const karmaLevel = getKarmaLevel(userData?.karmaScore || 0);

  const behaviorTypeLabels: Record<BehaviorType, string> = {
    payment_on_time: 'On-time Payments',
    payment_late: 'Late Payments',
    credit_utilization_low: 'Low Credit Use',
    credit_utilization_high: 'High Credit Use',
    new_credit_account: 'New Accounts',
    credit_check: 'Credit Checks'
  };

  const COLORS = ['#10b981', '#ef4444', '#6366f1', '#f59e0b', '#8b5cf6', '#06b6d4'];

  const pieData: PieChartData[] = summary?.behaviorSummary.map(item => ({
    name: behaviorTypeLabels[item._id] || item._id,
    value: Math.abs(item.totalKarma),
    positive: item.totalKarma > 0
  })) || [];

  const barData: BarChartData[] = summary?.behaviorSummary.map(item => ({
    name: behaviorTypeLabels[item._id] || item._id,
    karma: item.totalKarma,
    count: item.count
  })) || [];

  if (loading) {
    return (
      <div className="karma-score">
        <div className="loading-container">
          <ClipLoader size={50} color="#6366f1" />
        </div>
      </div>
    );
  }

  return (
    <div className="karma-score">
      <div className="karma-overview">
        <div className="score-card">
          <div className="score-header">
            <h2>Your Credit Karma</h2>
            <div className="level-badge" style={{ backgroundColor: karmaLevel.color }}>
              <i className="level-icon fas fa-star"></i>
              {karmaLevel.level}
            </div>
          </div>
          <div className="score-display">
            <div className="score-number">{userData?.karmaScore || 0}</div>
            <div className="score-label">Karma Points</div>
          </div>
          {karmaLevel.next && (
            <div className="progress-section">
              <div className="progress-info">
                <span className="progress-label">Progress to {karmaLevel.next}</span>
                <span className="progress-points">{karmaLevel.needed} points needed</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${(() => {
                      const score = userData?.karmaScore || 0;
                      if (score < 50) return (score / 50) * 100;
                      if (score < 100) return ((score - 50) / 50) * 100;
                      if (score < 250) return ((score - 100) / 150) * 100;
                      if (score < 500) return ((score - 250) / 250) * 100;
                      return 100;
                    })()}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {summary && summary.behaviorSummary.length > 0 && (
        <>
          <div className="karma-charts">
            <div className="chart-container">
              <div className="chart-header">
                <h3>Karma Distribution</h3>
                <p className="chart-subtitle">Breakdown by behavior type</p>
              </div>
              <div className="chart-content">
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
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-header">
                <h3>Behavior Impact</h3>
                <p className="chart-subtitle">Karma points by behavior</p>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="karma" radius={[8, 8, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.karma > 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="behavior-summary">
            <div className="section-header">
              <h3>Behavior Summary</h3>
              <p className="section-subtitle">Your credit behavior patterns</p>
            </div>
            <div className="summary-grid">
              {summary.behaviorSummary.map((item) => (
                <div key={item._id} className="summary-card">
                  <div className={`summary-icon ${item.totalKarma > 0 ? 'positive' : 'negative'}`}>
                    {item.totalKarma > 0 ? (
                      <i className="fas fa-star"></i>
                    ) : (
                      <i className="fas fa-exclamation-circle"></i>
                    )}
                  </div>
                  <div className="summary-content">
                    <h4 className="behavior-type">{behaviorTypeLabels[item._id] || item._id}</h4>
                    <div className="summary-stats">
                      <span className="behavior-count">
                        <i className="stat-icon fas fa-calendar-alt"></i>
                        {item.count} times
                      </span>
                      <span className={`behavior-karma ${item.totalKarma > 0 ? 'positive' : 'negative'}`}>
                        {item.totalKarma > 0 ? '+' : ''}{item.totalKarma} karma
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="leaderboard">
        <div className="section-header">
          <h3>Top 10 Leaderboard</h3>
          <p className="section-subtitle">Highest karma earners</p>
        </div>
        <div className="leaderboard-list">
          {leaderboard.slice(0, 10).map((user, index) => (
            <div key={user._id} className={`leaderboard-item ${user._id === userData?._id ? 'current-user' : ''}`}>
              <div className="rank-badge">
                {index === 0 && '🥇'}
                {index === 1 && '🥈'}
                {index === 2 && '🥉'}
                {index > 2 && `#${index + 1}`}
              </div>
              <div className="user-info">
                <div className="user-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="username">{user.username}</span>
              </div>
              <div className="score-info">
                <span className="score">{user.karmaScore}</span>
                <span className="score-label">points</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KarmaScore;