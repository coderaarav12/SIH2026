import { useState, useEffect } from "react";
import { apiUrl } from "./lib/env";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
    const validKey = (import.meta.env.VITE_SITE_KEY || "").trim();
    if (key.trim() === validKey) {
      localStorage.setItem("site_access_granted", "true");
      onAccessGranted();
    } else {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-3xl"
    >
      <div className="w-full max-w-[400px] bg-white/70 backdrop-blur-xl border border-white/50 p-10 rounded-[32px] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.2)] flex flex-col items-center text-center mx-4">
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
    </motion.div>
  );
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.02 }}
    transition={{ duration: 0.5, ease: "easeInOut" }}
    className="w-full min-h-screen absolute top-0 left-0"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = ({ theme, setTheme, isAuthenticated }: any) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Group all dashboard routes under a single key to prevent re-animation on tab change
  const routeKey = location.pathname.startsWith('/dashboard') ? '/dashboard' : location.pathname;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={routeKey}>
        <Route path="/" element={
          <PageWrapper>
            {isAuthenticated() ? <Navigate to="/dashboard/overview" /> : <LandingPage onNavigate={() => navigate('/login')} />}
          </PageWrapper>
        } />
        <Route path="/login" element={
          <PageWrapper>
            {isAuthenticated() ? <Navigate to="/dashboard/overview" /> : <LoginPage onNavigate={() => navigate('/')} onLogin={() => navigate('/dashboard/overview')} />}
          </PageWrapper>
        } />
        <Route path="/dashboard/*" element={
          <PageWrapper>
            {isAuthenticated() ? <Dashboard theme={theme} setTheme={setTheme} onLogout={() => { localStorage.removeItem('token'); navigate('/'); }} /> : <Navigate to="/login" />}
          </PageWrapper>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  const [theme, setTheme] = useState('default');
  const [accessGranted, setAccessGranted] = useState(() => localStorage.getItem('site_access_granted') === 'true');

  const isAuthenticated = () => !!localStorage.getItem('token');

  const GlobalVideoBackground = () => (
    <video 
      autoPlay 
      loop 
      muted 
      playsInline 
      className="fixed inset-0 w-full h-full object-cover -z-10 filter blur-sm brightness-[0.6] scale-105"
    >
      <source src="/bg-video.mp4" type="video/mp4" />
    </video>
  );

  return (
    <BrowserRouter>
      <div className={`theme-${theme} min-h-screen bg-transparent text-[#333333] font-sans selection:bg-[var(--border-color)] relative overflow-x-hidden`}>
        <GlobalVideoBackground />
        
        <AnimatePresence mode="wait">
          {!accessGranted ? (
            <SiteGate key="site-gate" onAccessGranted={() => setAccessGranted(true)} />
          ) : (
            <motion.div key="app-content" className="w-full min-h-screen relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
              <AnimatedRoutes theme={theme} setTheme={setTheme} isAuthenticated={isAuthenticated} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}
