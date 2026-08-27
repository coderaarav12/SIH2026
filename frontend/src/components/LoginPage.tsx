import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Box, KeyRound, Mail, Lock } from 'lucide-react';

interface LoginPageProps {
  onNavigate: () => void;
  onLogin: () => void;
}

export default function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); try { const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); const data = await response.json(); if (data.success) { localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); onLogin(); } else { alert(data.message || 'Login failed'); } } catch (err) { console.error(err); alert('Login error'); } };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-main)]">
      
      {/* Left Panel - Form */}
      <div className="w-full md:w-[480px] lg:w-[560px] bg-[var(--bg-card)] border-r border-[var(--border-color)] flex flex-col px-8 py-10 md:px-16 md:py-12 z-10 shrink-0 min-h-screen overflow-y-auto">
        
        <button 
          onClick={onNavigate}
          className="flex items-center gap-2 text-sm text-[#888888] hover:text-[var(--text-primary)] transition-colors w-fit mb-12 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </button>

        <div className="flex-1 flex flex-col justify-center max-w-[360px] w-full mx-auto">
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
                  placeholder="admin@cpse.gov.in"
                  className="w-full pl-12 pr-5 py-4 bg-[var(--bg-alt)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:border-[#5D675B] text-[var(--text-primary)] transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Password</label>
                <a href="#" className="text-[10px] uppercase tracking-wider text-[#5D675B] font-bold hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-5 py-4 bg-[var(--bg-alt)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:border-[#5D675B] text-[var(--text-primary)] transition-colors"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="mt-4 w-full py-4 bg-[#5D675B] text-white rounded-2xl font-semibold shadow-lg shadow-[#5D675B]/20 hover:bg-[#4E564C] transition-colors"
            >
              Sign In to Console
            </button>
            
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#F0EFED]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[var(--bg-card)] px-4 text-[#888888]">Or continue with</span>
              </div>
            </div>

            <button 
              type="button"
              className="w-full bg-[var(--bg-alt)] text-[var(--text-primary)] border border-[var(--border-color)] py-4 rounded-2xl font-semibold hover:bg-[var(--border-color)] transition-colors flex items-center justify-center gap-2"
            >
              Use Gmail OTP
            </button>
          </form>
        </div>
        
        <div className="mt-10 pt-8 border-t border-[#F0EFED] text-center">
          <p className="text-sm text-[#888888]">
            New to SyncMasters? <a href="#" className="text-[var(--text-primary)] font-semibold underline underline-offset-4">Request Access</a>
          </p>
        </div>
      </div>

      {/* Right Panel - Information & Context */}
      <div className="hidden md:flex flex-1 bg-[var(--bg-main)] items-center justify-center p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border-color)] p-10 rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]"
        >
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#F0EFED]">
            <div className="w-12 h-12 bg-[var(--bg-alt)] flex items-center justify-center rounded-2xl border border-[var(--border-color)]">
              <KeyRound className="w-6 h-6 text-[#5D675B]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] text-lg">Demo Access</h3>
              <p className="text-sm text-[#888888]">Pre-seeded credentials for testing</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2 ml-1">Ministry Admin</div>
              <div className="text-sm text-[var(--text-primary)] bg-[var(--bg-alt)] p-4 rounded-2xl border border-[var(--border-color)] flex justify-between">
                <span className="font-medium">admin@cpse.gov.in</span>
                <span className="text-[#888888]">Admin@12345</span>
              </div>
            </div>
            
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2 ml-1">CPCL Reviewer</div>
              <div className="text-sm text-[var(--text-primary)] bg-[var(--bg-alt)] p-4 rounded-2xl border border-[var(--border-color)] flex justify-between">
                <span className="font-medium">reviewer@cpcl.co.in</span>
                <span className="text-[#888888]">Reviewer@12345</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2 ml-1">IOCL Store Officer</div>
              <div className="text-sm text-[var(--text-primary)] bg-[var(--bg-alt)] p-4 rounded-2xl border border-[var(--border-color)] flex justify-between">
                <span className="font-medium">store.officer@iocl.co.in</span>
                <span className="text-[#888888]">Officer@12345</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-[var(--bg-alt)] border border-[var(--border-color)] text-[var(--text-secondary)] text-sm leading-relaxed rounded-2xl">
            <strong className="text-[var(--text-primary)]">System Status:</strong> Backend endpoints are active at localhost:5000. Use these credentials to test the rule-based review workflow.
          </div>
        </motion.div>
      </div>

    </div>
  );
}
