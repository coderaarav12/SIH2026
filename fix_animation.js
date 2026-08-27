const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/LoginPage.tsx', 'utf8');

// Replace the bad AnimatePresence msg block
const badMsgBlock = `<div className="h-6 relative overflow-hidden flex items-center justify-center min-w-[280px]">
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
              </div>`;

const goodMsgBlock = `
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
`;

code = code.replace(badMsgBlock, goodMsgBlock);

// Also add loginMessage state
if (!code.includes("const [loginMessage")) {
  code = code.replace(
    `const [loginStatus, setLoginStatus] = useState<'idle' | 'authenticating' | 'syncing'>('idle');`,
    `const [loginStatus, setLoginStatus] = useState<'idle' | 'authenticating' | 'syncing'>('idle');\n  const [loginMessage, setLoginMessage] = useState('Syncing CPSE Databases...');`
  );
}

// And update the setTimeout inside handleSubmit
const oldSubmit = `        setLoginStatus('syncing');
        setTimeout(() => {
          onLogin(); 
        }, 3200); // Increased slightly so they can enjoy the animation`;

const newSubmit = `        setLoginStatus('syncing');
        setLoginMessage('Syncing CPSE Databases...');
        setTimeout(() => setLoginMessage('Loading Semantic AI Models...'), 1400);
        setTimeout(() => setLoginMessage('Decrypting Master Data...'), 2600);
        setTimeout(() => {
          onLogin(); 
        }, 3800); // Wait 3.8s to show sequence`;

code = code.replace(oldSubmit, newSubmit);

// And we need useEffect imported if not already. But wait, we don't even use useEffect here, we just use setTimeout.
fs.writeFileSync('frontend/src/components/LoginPage.tsx', code);
console.log('Fixed animation messages');
