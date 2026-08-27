import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Box, KeyRound, Mail, Lock, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onNavigate: () => void;
  onLogin: () => void;
}

export default function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState<'idle' | 'authenticating' | 'syncing'>('idle');
  const [loginMessage, setLoginMessage] = useState('Syncing CPSE Databases...');

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    setLoginStatus('authenticating');
    try { 
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); 
      const data = await response.json(); 
      if (data.success) { 
        localStorage.setItem('token', data.token); 
        localStorage.setItem('user', JSON.stringify(data.user)); 
        setLoginStatus('syncing');
        setLoginMessage('Syncing CPSE Databases...');
        setTimeout(() => setLoginMessage('Loading Semantic AI Models...'), 1400);
        setTimeout(() => setLoginMessage('Decrypting Master Data...'), 2600);
        setTimeout(() => {
          onLogin(); 
        }, 3800); // Wait 3.8s to show sequence
      } else { 
        setLoginStatus('idle');
        alert(data.message || 'Login failed'); 
      } 
    } catch (err) { 
      setLoginStatus('idle');
      console.error(err); alert('Login error'); 
    } 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-4">

      <AnimatePresence>
        {loginStatus === 'syncing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-main)]"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5D675B]/10 to-transparent"></div>
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0, 
                    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
                    y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000) 
                  }}
                  animate={{ 
                    opacity: [0, 0.9, 0],
                    y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000)]
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 2, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute w-1.5 h-1.5 bg-[#5D675B] rounded-full shadow-[0_0_12px_rgba(93,103,91,0.9)]"
                />
              ))}
            </div>
            
            <div className="relative flex flex-col items-center z-10 bg-[var(--bg-card)] p-12 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-[var(--border-color)]">
              <Loader2 className="w-12 h-12 text-[#5D675B] animate-spin mb-6" />
              <motion.h2 
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-2xl font-bold text-[var(--text-primary)] mb-3 tracking-tight"
              >
                Securely Authenticating...
              </motion.h2>
              
              <div className="h-6 relative overflow-hidden flex items-center justify-center min-w-[280px]">
                <AnimatePresence mode="wait">
                   <motion.p
                      key={loginMessage}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="absolute text-sm font-bold text-[#5D675B] uppercase tracking-widest"
                   >
                      {loginMessage}
                   </motion.p>
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[480px] bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col p-8 md:p-12 rounded-[32px] shadow-sm">
        
        <button 
          onClick={onNavigate}
          className="flex items-center gap-2 text-sm text-[#888888] hover:text-[var(--text-primary)] transition-colors w-fit mb-12 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </button>

        <div className="flex-1 flex flex-col justify-center w-full mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-[#5D675B] flex items-center justify-center rounded-full">
              <Box className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-xl tracking-tight text-[var(--text-primary)]">SyncMasters</span>
          </div>

          <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            Welcome Back
          </h1>
          <p className="text-[#888888] text-sm mb-8">
            Enter your credentials to access the console
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cpse.gov.in"
                  className="w-full pl-12 pr-5 py-4 bg-[var(--bg-alt)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:border-[#5D675B] text-[var(--text-primary)] transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-12 pr-5 py-4 bg-[var(--bg-alt)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:border-[#5D675B] text-[var(--text-primary)] transition-colors"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loginStatus !== 'idle'} 
              className="mt-4 w-full py-4 bg-[#5D675B] text-white rounded-2xl font-semibold shadow-lg shadow-[#5D675B]/20 hover:bg-[#4E564C] transition-colors"
            >
              {loginStatus === 'authenticating' ? 'Verifying...' : 'Sign In to Console'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
