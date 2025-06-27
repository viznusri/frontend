import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import BehaviorFeed from './BehaviorFeed';
import KarmaScore from './KarmaScore';
import Rewards from './Rewards';
import AdminDashboard from './AdminDashboard';
import { users, behaviors, rewards } from '../services/api';
import { User, Behavior, RewardWithStatus } from '../types';

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [behaviorList, setBehaviorList] = useState<Behavior[]>([]);
  const [rewardsList, setRewardsList] = useState<RewardWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, behaviorsRes, rewardsRes] = await Promise.all([
        users.getMe(),
        behaviors.getAll(),
        rewards.getAll()
      ]);

      setUserData(userRes.data);
      setBehaviorList(behaviorsRes.data.behaviors);
      setRewardsList(rewardsRes.data);
      
      // Navigate to default route if at base routes path
      if (location.pathname === '/routes' || location.pathname === '/routes/') {
        if (userRes.data.role === 'admin') {
          navigate('/routes/dashboard');
        } else {
          navigate('/routes/feed');
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <h2 className="logo-text">
              CRED<span className="logo-accent">Karma</span>
            </h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-container">
            {/* Admin-only tabs */}
            {userData?.role === 'admin' && (
              <>
                <Link 
                  to="/routes/dashboard"
                  className={`nav-item ${location.pathname === '/routes/dashboard' ? 'active' : ''}`}
                >
                  <div className="nav-item-content">
                    <i className="nav-icon fas fa-chart-bar"></i>
                    <span className="nav-label">Analytics</span>
                  </div>
                </Link>
              </>
            )}
            
            {/* Common tabs for all users */}
            <Link 
              to="/routes/feed"
              className={`nav-item ${location.pathname === '/routes/feed' ? 'active' : ''}`}
            >
              <div className="nav-item-content">
                <i className="nav-icon fas fa-calendar-check"></i>
                <span className="nav-label">Behavior Feed</span>
              </div>
            </Link>
            
            {/* Admin-only Karma Score tab */}
            {userData?.role === 'admin' && (
              <Link 
                to="/routes/karma"
                className={`nav-item ${location.pathname === '/routes/karma' ? 'active' : ''}`}
              >
                <div className="nav-item-content">
                  <i className="nav-icon fas fa-star"></i>
                  <span className="nav-label">Karma Score</span>
                </div>
              </Link>
            )}
            
            <Link 
              to="/routes/rewards"
              className={`nav-item ${location.pathname === '/routes/rewards' ? 'active' : ''}`}
            >
              <div className="nav-item-content">
                <i className="nav-icon fas fa-gift"></i>
                <span className="nav-label">Rewards</span>
                {rewardsList.filter(r => r.canUnlock && !r.isUnlocked).length > 0 && (
                  <span className="nav-badge nav-badge-success">
                    {rewardsList.filter(r => r.canUnlock && !r.isUnlocked).length}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-section">
            <div className="user-info-sidebar">
              <div className="user-avatar-sidebar">
                {userData?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <span className="user-name">{userData?.username}</span>
                <span className="user-role">{userData?.role === 'admin' ? 'Administrator' : 'User'}</span>
                <div className="karma-info">
                  <i className="karma-icon-small fas fa-star"></i>
                  <span className="karma-score-small">{userData?.karmaScore || 0}</span>
                </div>
              </div>
            </div>
            <button className="logout-btn-sidebar" onClick={handleLogout}>
              <i className="logout-icon fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="main-header">
          <h1 className="page-title">
            {location.pathname === '/routes/dashboard' && 'Analytics Dashboard'}
            {location.pathname === '/routes/feed' && 'Behavior Feed'}
            {location.pathname === '/routes/karma' && 'Karma Score'}
            {location.pathname === '/routes/rewards' && 'Rewards'}
          </h1>
          <div className="header-actions">
            <div className="karma-display">
              <i className="karma-star fas fa-star"></i>
              <span className="karma-value">{userData?.karmaScore || 0}</span>
              <span className="karma-label">Karma Points</span>
            </div>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="dashboard" element={
              userData?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/routes/feed" />
            } />
            <Route path="feed" element={
              <BehaviorFeed behaviors={behaviorList} onUpdate={fetchData} />
            } />
            <Route path="karma" element={
              userData?.role === 'admin' ? <KarmaScore userData={userData} behaviors={behaviorList} /> : <Navigate to="/routes/feed" />
            } />
            <Route path="rewards" element={
              <Rewards rewards={rewardsList} userData={userData} onUpdate={fetchData} />
            } />
            <Route path="*" element={
              <Navigate to={userData?.role === 'admin' ? "/routes/dashboard" : "/routes/feed"} />
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;