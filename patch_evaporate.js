const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/LoginPage.tsx', 'utf8');

const oldOverlayHtml = `            <div className="absolute inset-0 overflow-hidden">
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
            </div>`;
            
const newOverlayHtml = `            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5D675B]/10 to-transparent"></div>
            </div>`;

code = code.replace(oldOverlayHtml, newOverlayHtml);

const oldTimeouts = `          setLoginStatus('syncing');
          setLoginMessage('Syncing CPSE Databases...');
          setTimeout(() => setLoginMessage('Loading Semantic AI Models...'), 1400);
          setTimeout(() => setLoginMessage('Decrypting Master Data...'), 2600);
          setTimeout(() => {
            onLogin(); 
          }, 3800); // Wait 3.8s to show sequence`;
          
const newTimeouts = `          setLoginStatus('syncing');
          setLoginMessage('Authenticating Credentials...');
          setTimeout(() => setLoginMessage('Syncing CPSE Databases...'), 1000);
          setTimeout(() => setLoginMessage('Loading Semantic AI Models...'), 2000);
          setTimeout(() => setLoginMessage('Decrypting Master Data...'), 3000);
          setTimeout(() => {
            onLogin(); 
          }, 4000); // Wait 4s exactly`;

code = code.replace(oldTimeouts, newTimeouts);

const oldMotionP = `                   <motion.p
                      key={loginMessage}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="absolute text-sm font-bold text-[#5D675B] uppercase tracking-widest"
                   >
                      {loginMessage}
                   </motion.p>`;
                   
const newMotionP = `                   <motion.p
                      key={loginMessage}
                      initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -15, filter: "blur(6px)", transition: { duration: 0.4 } }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute text-sm font-bold text-[#5D675B] uppercase tracking-widest"
                   >
                      {loginMessage}
                   </motion.p>`;

code = code.replace(oldMotionP, newMotionP);

fs.writeFileSync('frontend/src/components/LoginPage.tsx', code);
console.log('Evaporating text applied');
