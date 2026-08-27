import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

const SiteGate = ({ onAccessGranted }: { onAccessGranted: () => void }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/auth/verify-site-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('site_access_granted', 'true');
        onAccessGranted();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-3xl">
      <div className="w-full max-w-[400px] bg-white p-10 rounded-[32px] shadow-2xl flex flex-col items-center text-center mx-4">
        <div className="w-16 h-16 bg-[#5D675B] text-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#5D675B]/20">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Restricted Access</h2>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">This SIH prototype is protected. Enter the security key to view the portal.</p>
        
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Security Key"
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#5D675B] text-center tracking-[0.3em] font-mono font-bold text-lg transition-colors"
            required
          />
          {error && <p className="text-xs text-red-500 font-bold -mt-2 uppercase tracking-wider">Invalid Security Key</p>}
          <button type="submit" disabled={loading} className="w-full py-4 bg-[#5D675B] text-white font-bold rounded-2xl hover:bg-[#4E564C] transition-colors shadow-lg shadow-[#5D675B]/20">
            {loading ? 'Verifying...' : 'Unlock Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [theme, setTheme] = useState('default');
  const [accessGranted, setAccessGranted] = useState(() => localStorage.getItem('site_access_granted') === 'true');

  const isAuthenticated = () => !!localStorage.getItem('token');

  if (!accessGranted) {
    return (
      <div className={`theme-${theme} min-h-screen bg-[var(--bg-main)] text-[#333333] font-sans selection:bg-[var(--border-color)]`}>
        <SiteGate onAccessGranted={() => setAccessGranted(true)} />
      </div>
    );
  }

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
