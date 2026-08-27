const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/LoginPage.tsx', 'utf8');

// Ensure framer-motion is imported if not already
if (!code.includes("import { motion")) {
  code = code.replace("import { useState } from 'react';", "import { useState } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';");
} else if (!code.includes("AnimatePresence")) {
  code = code.replace("import { motion }", "import { motion, AnimatePresence }");
}

// Add Loader2 to lucide imports
code = code.replace("Mail, Lock", "Mail, Lock, Loader2");
if(!code.includes("Loader2")) {
   code = code.replace("import { ArrowLeft", "import { ArrowLeft, Loader2");
}

// Update the component state
const oldState = `  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');`;

const newState = `  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState<'idle' | 'authenticating' | 'syncing'>('idle');`;

code = code.replace(oldState, newState);

// Update handleSubmit
const oldSubmit = `  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); try { const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); const data = await response.json(); if (data.success) { localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); onLogin(); } else { alert(data.message || 'Login failed'); } } catch (err) { console.error(err); alert('Login error'); } };`;

const newSubmit = `  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    setLoginStatus('authenticating');
    try { 
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); 
      const data = await response.json(); 
      if (data.success) { 
        localStorage.setItem('token', data.token); 
        localStorage.setItem('user', JSON.stringify(data.user)); 
        setLoginStatus('syncing');
        setTimeout(() => {
          onLogin(); 
        }, 3200); // Increased slightly so they can enjoy the animation
      } else { 
        setLoginStatus('idle');
        alert(data.message || 'Login failed'); 
      } 
    } catch (err) { 
      setLoginStatus('idle');
      console.error(err); alert('Login error'); 
    } 
  };`;

code = code.replace(oldSubmit, newSubmit);

// Disable button logic
code = code.replace(`<button \n              type="submit"`, `<button \n              type="submit" disabled={loginStatus !== 'idle'} `);
code = code.replace(`Sign In to Console`, `{loginStatus === 'authenticating' ? 'Verifying...' : 'Sign In to Console'}`);


// Add overlay
const overlayHtml = `
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
                    key="msg1"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="absolute text-sm font-bold text-[#5D675B] uppercase tracking-widest"
                  >
                    Syncing CPSE Databases
                  </motion.p>
                  <motion.p
                    key="msg2"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, delay: 1.6 }}
                    className="absolute text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest"
                  >
                    Loading Semantic AI Models
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
`;

code = code.replace(`return (\n    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-4">`, `return (\n    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-4">\n${overlayHtml}`);

fs.writeFileSync('frontend/src/components/LoginPage.tsx', code);
console.log('LoginPage patched with animation');
