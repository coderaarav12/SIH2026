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
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4">

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
            </div>
            
            <div className="relative flex flex-col items-center z-10 bg-white/70 backdrop-blur-xl p-12 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white/50">
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
                      initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -15, filter: "blur(6px)", transition: { duration: 0.4 } }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
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

      <div className="w-full max-w-[480px] flex flex-col items-center">
        
        {/* Back Button Outside Card */}
        <button 
          onClick={onNavigate}
          className="self-start flex items-center gap-2 text-sm text-[var(--text-primary)] bg-white/40 backdrop-blur-md border border-white/40 px-4 py-2 rounded-full hover:bg-white hover:scale-105 transition-all duration-300 shadow-sm mb-6 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </button>

        {/* Login Card */}
        <div className="w-full bg-white/70 backdrop-blur-2xl border border-white/50 flex flex-col p-8 md:p-12 rounded-[32px] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col items-center text-center w-full mx-auto">
            
            <div className="w-14 h-14 bg-[#5D675B] flex items-center justify-center rounded-full mb-4 shadow-lg shadow-[#5D675B]/20">
              <Box className="w-6 h-6 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-600 font-medium text-sm mb-10">
              Enter your credentials to access the console
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full text-left">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@cpse.gov.in"
                    className="w-full pl-12 pr-5 py-4 bg-white/60 border border-white/60 rounded-2xl focus:outline-none focus:border-[#5D675B] focus:bg-white text-gray-900 font-medium transition-colors shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full pl-12 pr-5 py-4 bg-white/60 border border-white/60 rounded-2xl focus:outline-none focus:border-[#5D675B] focus:bg-white text-gray-900 font-medium transition-colors shadow-sm"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" disabled={loginStatus !== 'idle'} 
                className="mt-4 w-full py-4 bg-[#5D675B] text-white rounded-2xl font-bold hover:scale-[1.02] shadow-lg shadow-[#5D675B]/20 hover:bg-black transition-all duration-300"
              >
                {loginStatus === 'authenticating' ? 'Verifying...' : 'Sign In to Console'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
