import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [theme, setTheme] = useState('default');

  const isAuthenticated = () => !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <div className={`theme-${theme} min-h-screen bg-[var(--bg-main)] text-[#333333] font-sans selection:bg-[var(--border-color)]`}>
        <Routes>
          <Route path="/" element={isAuthenticated() ? <Navigate to="/dashboard/overview" /> : <LandingPage onNavigate={() => window.location.href='/login'} />} />
          <Route path="/login" element={isAuthenticated() ? <Navigate to="/dashboard/overview" /> : <LoginPage onNavigate={() => window.location.href='/'} onLogin={() => window.location.href='/dashboard/overview'} />} />
          <Route path="/dashboard/*" element={isAuthenticated() ? <Dashboard theme={theme} setTheme={setTheme} onLogout={() => { localStorage.removeItem('token'); window.location.href='/'; }} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
