import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Activity } from 'lucide-react';

interface ImmersiveVoiceModeProps {
  onClose: () => void;
  pageContext?: any;
}

export default function ImmersiveVoiceMode({ onClose, pageContext }: ImmersiveVoiceModeProps) {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const isThinkingRef = useRef(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("Initializing connection...");
  const [aiResponse, setAiResponse] = useState("");
  const [history, setHistory] = useState("");
  const historyRef = useRef<string>("");

  const recognitionRef = useRef<any>(null);
  const keepAliveRef = useRef<boolean>(true);
  const isSpeakingRef = useRef<boolean>(false);

  const killAudio = () => {
    keepAliveRef.current = false;
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
        try { recognitionRef.current.onend = null; } catch(e) {} 
        try { recognitionRef.current.abort(); } catch(e) {}
        try { recognitionRef.current.stop(); } catch(e) {}
    }
  };

  useEffect(() => {
    keepAliveRef.current = true;
    
    // Preload TTS Voices immediately
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
    }
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
      
      recognition.onstart = () => {
          setIsListening(true);
          setTranscript("Listening for your voice...");
      };
      
      recognition.onresult = async (event: any) => {
        if (isThinkingRef.current) return;

        let fullText = "";
        for (let i = 0; i < event.results.length; i++) {
            fullText += event.results[i][0].transcript;
        }
        
        setTranscript(fullText);

        if (event.results[event.resultIndex].isFinal) {
            await sendToAI(fullText);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
            setIsListening(false);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
        // If we are NOT speaking, and we WANT to be alive, restart mic
        // (This handles the mic timing out after silence natively)
        if (keepAliveRef.current && !isSpeakingRef.current) {
            setTimeout(() => {
                if (keepAliveRef.current && !isSpeakingRef.current && recognitionRef.current) {
                    try { recognitionRef.current.start(); } catch(e) {}
                }
            }, 300);
        }
      };
      
      recognitionRef.current = recognition;
      
      setTimeout(() => {
          if (keepAliveRef.current) {
              try { recognition.start(); } catch(e) {}
          }
      }, 300);
    }

    return () => {
      killAudio();
    };
  }, []);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    
    if (isSpeakingRef.current) {
        // INTERRUPT: Chrome sometimes drops onend, so we manually force state reset here
        window.speechSynthesis.cancel();
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        keepAliveRef.current = true;
        setTimeout(() => { try { recognition.start(); } catch(e) {} }, 50);
    } else if (isListening) {
        // USER MANUALLY MUTING
        keepAliveRef.current = false;
        recognition.stop();
        setTranscript("Standby (Mic Muted)");
    } else {
        // USER MANUALLY UNMUTING
        keepAliveRef.current = true;
        setTranscript("Starting mic...");
        setTimeout(() => { try { recognition.start(); } catch(e) {} }, 50);
    }
  };

  const sendToAI = async (text: string) => {
    if (!text.trim()) return;
    if (isThinkingRef.current) return;
    setIsThinking(true);
    isThinkingRef.current = true;
    
    if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
    }
    
    const uiContext = pageContext ? `[User is currently on the '${pageContext.activeTab}' tab. Logged in as ${pageContext.userName} (${pageContext.userRole}). Data on screen: ${JSON.stringify(pageContext)}]` : "";

    try {
      const response = await fetch('https://stadium-hydrant-snowstorm.ngrok-free.dev/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: text,
            context: historyRef.current,
            ui_state: uiContext
        })
      });
      const data = await response.json();
      const reply = data.reply;
      
      setAiResponse(reply);
      historyRef.current += `\nUser: ${text}\nAI: ${reply}`;
      setHistory(historyRef.current);
      speak(reply);
    } catch (error) {
      setAiResponse("Connection to local AI Swarm failed. Is server.py running?");
      setIsThinking(false);
        isThinkingRef.current = false;
      // Restart mic since we failed
      if (keepAliveRef.current && recognitionRef.current) {
          try { recognitionRef.current.start(); } catch(e) {}
      }
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[*_~`#]+/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\|/g, ', ')
      .replace(/\n-/g, ', ')
      .replace(/-/g, ' ')
      .replace(/\n/g, '. ');
      
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    
    let voice = voices.find((v: any) => v.name === 'Google UK English Female');
    if (!voice) voice = voices.find((v: any) => v.name.includes('Neerja'));
    if (!voice) voice = voices.find((v: any) => v.name.includes('Zira'));
    if (!voice) voice = voices.find((v: any) => v.name.includes('Hazel'));
    if (!voice) voice = voices.find((v: any) => v.name.includes('Sonia'));
    if (!voice) voice = voices.find((v: any) => v.name.includes('Female') && v.lang.includes('en'));
    if (!voice) voice = voices.find((v: any) => v.lang === 'en-GB');
    
    if (voice) utterance.voice = voice;
    
    utterance.pitch = 1.1;
    utterance.rate = 1.05;
    
    utterance.onstart = () => {
        setIsThinking(false);
        isThinkingRef.current = false;
        setIsSpeaking(true);
        isSpeakingRef.current = true;
        
        // Mute mic while AI speaks to prevent feedback loops and browser crashing
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch(e) {}
        }
    };
    
    utterance.onend = () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        
        // Auto-resume listening AFTER the AI finishes speaking
        if (keepAliveRef.current && recognitionRef.current) {
            setTimeout(() => {
                try { recognitionRef.current.start(); } catch(e) {}
            }, 300);
        }
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const handleClose = () => {
    killAudio();
    onClose();
  };

  const isDataDense = aiResponse.includes('|') || aiResponse.includes('```') || (aiResponse.includes('- ') && aiResponse.split('- ').length > 3);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, filter: 'blur(40px)', scale: 1.05 }}
        animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
        exit={{ opacity: 0, filter: 'blur(40px)', scale: 0.95 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="theme-dark fixed inset-0 z-[100] flex bg-[var(--bg-main)] overflow-hidden"
      >
        <motion.div 
          animate={{
            scale: isListening ? [1, 1.2, 1] : isSpeaking ? [1, 1.5, 1] : 1,
            opacity: isThinking ? [0.3, 0.6, 0.3] : 0.4
          }}
          transition={{ duration: isSpeaking ? 1.5 : 2, repeat: Infinity }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 dark:bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"
        />

        <button 
          onClick={handleClose}
          className="absolute top-8 right-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-4 rounded-full bg-[var(--bg-alt)] border border-[var(--border-color)] shadow-sm z-50 hover:scale-105"
        >
          <X size={24} />
        </button>

        <motion.div 
            layout
            className={`w-full h-full flex transition-all duration-1000 ease-in-out ${isDataDense ? 'flex-row' : 'flex-col items-center justify-center'}`}
        >
            <motion.div 
                layout
                className={`relative flex flex-col items-center justify-center ${isDataDense ? 'w-1/3 h-full border-r border-[var(--border-color)] bg-[var(--bg-card)]/50' : 'w-full h-1/2 mt-16'}`}
            >
              <motion.button
                onClick={toggleListening}
                animate={{
                  scale: isListening ? [1, 1.1, 1] : isSpeaking ? [1, 1.2, 1] : 1,
                  boxShadow: isSpeaking 
                    ? ["0px 0px 40px var(--stat-emerald-bg)", "0px 0px 80px var(--stat-emerald-bg)", "0px 0px 40px var(--stat-emerald-bg)"] 
                    : "0px 0px 20px rgba(99, 102, 241, 0.1)"
                }}
                transition={{ duration: isSpeaking ? 1 : 1.5, repeat: Infinity }}
                className={`w-40 h-40 rounded-full flex items-center justify-center backdrop-blur-md border border-[var(--border-color)] z-10 transition-colors shadow-xl ${
                  isThinking ? 'bg-[var(--stat-blue-bg)] text-[var(--stat-blue-text)]' : 
                  isSpeaking ? 'bg-[var(--stat-emerald-bg)] text-[var(--stat-emerald-text)] border-[var(--stat-emerald-text)]' : 
                  !isListening ? 'bg-[var(--stat-red-bg)] text-[var(--stat-red-text)] border-[var(--stat-red-text)]' : 
                  'bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-alt)]'
                }`}
              >
                {isThinking ? <Activity size={48} className="animate-pulse" /> : 
                 !isListening && !isSpeaking ? <MicOff size={48} /> : <Mic size={48} />}
              </motion.button>

              <div className="absolute -bottom-16 flex items-center justify-center h-8">
                  {isThinking ? (
                      <div className="flex gap-2">
                          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, delay: 0, duration: 0.8 }} className="w-2.5 h-2.5 bg-[var(--text-secondary)] rounded-full" />
                          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, delay: 0.2, duration: 0.8 }} className="w-2.5 h-2.5 bg-[var(--text-secondary)] rounded-full" />
                          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, delay: 0.4, duration: 0.8 }} className="w-2.5 h-2.5 bg-[var(--text-secondary)] rounded-full" />
                      </div>
                  ) : (
                      <motion.div 
                        initial={{ opacity: 0, filter: 'blur(5px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        key={isListening ? 'listening' : isSpeaking ? 'speaking' : 'muted'}
                        className="text-[var(--text-secondary)] text-sm font-bold tracking-[0.2em] uppercase"
                      >
                        {isSpeaking ? "Speaking (Tap to interrupt)" : !isListening ? "Muted" : "Listening..."}
                      </motion.div>
                  )}
              </div>
            </motion.div>

            <motion.div 
                layout
                className={`flex flex-col z-10 p-12 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isDataDense ? 'w-2/3 h-full items-start justify-center' : 'w-full max-w-5xl h-auto max-h-[60%] items-center justify-start text-center mt-8'}`}
            >
              <AnimatePresence mode="wait">
                  <motion.p 
                    key={transcript}
                    initial={{ opacity: 0, filter: 'blur(15px)', y: 20 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                    exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`font-light tracking-wide leading-relaxed text-[var(--text-primary)] ${isDataDense ? 'text-2xl mb-8 opacity-70 border-l-4 border-[var(--stat-emerald-text)] pl-6' : 'text-3xl opacity-90'}`}
                  >
                    "{transcript}"
                  </motion.p>
              </AnimatePresence>
              
              <AnimatePresence>
                {(isDataDense && aiResponse) && (
                  <motion.div 
                    initial={{ opacity: 0, filter: 'blur(20px)', scale: 0.95 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                    exit={{ opacity: 0, filter: 'blur(20px)', scale: 0.95 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-lg text-[var(--text-secondary)] font-medium leading-relaxed w-full whitespace-pre-wrap bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-color)] shadow-xl"
                  >
                    {aiResponse}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
