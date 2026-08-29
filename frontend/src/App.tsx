import { useState, useEffect } from "react";
import { apiUrl } from "./lib/env";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

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
        <motion.div key="app-content" className="w-full min-h-screen relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <AnimatedRoutes theme={theme} setTheme={setTheme} isAuthenticated={isAuthenticated} />
        </motion.div>
      </div>
    </BrowserRouter>
  );
}
