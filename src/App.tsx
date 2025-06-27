import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

const App: React.FC = () => {
  const token = localStorage.getItem('token');
  const userData = token ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  const defaultPath = userData?.role === 'admin' ? "/routes/dashboard" : "/routes/feed";

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!token ? <Login /> : <Navigate to={defaultPath} />} 
          />
          <Route 
            path="/register" 
            element={!token ? <Register /> : <Navigate to={defaultPath} />} 
          />
          <Route 
            path="/routes/*" 
            element={token ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={token ? defaultPath : "/login"} />} 
          />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#1a202c',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
              style: {
                border: '1px solid #10b981',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
              style: {
                border: '1px solid #ef4444',
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

export default App;