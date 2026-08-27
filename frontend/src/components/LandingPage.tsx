import { motion } from 'motion/react';
import { ArrowRight, Box, CheckCircle, Database, Search, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onNavigate: () => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white/40 backdrop-blur-md">
      {/* Navigation */}
      <nav className="w-full px-6 md:px-12 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#5D675B] flex items-center justify-center rounded-full shadow-lg">
            <Box className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-[var(--text-primary)] drop-shadow-sm">SyncMasters</span>
        </div>
        <button
          onClick={onNavigate}
          className="text-sm font-bold text-[var(--text-primary)] bg-white/50 px-6 py-2 rounded-full border border-white/50 shadow-sm hover:bg-white/80 transition-all backdrop-blur-sm"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block px-5 py-2 bg-white/80 backdrop-blur-md border border-white/50 text-[#5D675B] text-xs font-bold uppercase tracking-[0.1em] rounded-full mb-8 w-fit mx-auto shadow-sm"
        >
          <span>SIH 2026 Project</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[40px] md:text-[56px] lg:text-[64px] font-bold leading-[1.1] text-gray-900 -tracking-[0.03em] font-serif mb-6 drop-shadow-md"
        >
          Material Intelligence for <br className="hidden md:block" />
          Modern CPSEs
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-800 font-medium mb-10 max-w-2xl leading-relaxed drop-shadow-sm bg-white/30 backdrop-blur-sm p-4 rounded-2xl border border-white/20"
        >
          AI-driven standardisation and harmonization of material codes. 
          Eliminate duplicates, improve inventory visibility, and streamline procurement.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button 
            onClick={onNavigate}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900/90 backdrop-blur-sm text-white border border-gray-700 rounded-full font-bold shadow-xl hover:bg-black transition-all"
          >
            Access Platform
            <ArrowRight className="w-4 h-4" />
          </button>
          <a href="https://coderaarav12.github.io/SIH2026/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-8 py-4 bg-white/60 backdrop-blur-md border border-white/50 text-gray-900 rounded-full font-bold shadow-lg hover:bg-white/90 transition-colors">
            Read Documentation
          </a>
        </motion.div>
      </main>

      {/* Feature Grid */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 p-8 bg-white/60 backdrop-blur-xl border border-white/50 rounded-[32px] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.1)] hover:bg-white/70 transition-colors"
          >
            <div className="w-14 h-14 bg-white/80 border border-white rounded-2xl flex items-center justify-center shadow-sm">
              <Search className="w-7 h-7 text-[#5D675B]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-2">Semantic AI Matching</h3>
            <p className="text-gray-700 font-medium leading-relaxed">
              Understands material names semantically to detect equivalents across varying nomenclatures, expanding abbreviations and normalizing units automatically.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-4 p-8 bg-white/60 backdrop-blur-xl border border-white/50 rounded-[32px] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.1)] hover:bg-white/70 transition-colors"
          >
            <div className="w-14 h-14 bg-white/80 border border-white rounded-2xl flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-7 h-7 text-[#5D675B]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-2">Human-in-the-Loop</h3>
            <p className="text-gray-700 font-medium leading-relaxed">
              High-confidence matches are auto-suggested, while borderline cases are routed to human reviewers. Every decision is recorded in a secure audit trail.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4 p-8 bg-white/60 backdrop-blur-xl border border-white/50 rounded-[32px] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.1)] hover:bg-white/70 transition-colors"
          >
            <div className="w-14 h-14 bg-white/80 border border-white rounded-2xl flex items-center justify-center shadow-sm">
              <Database className="w-7 h-7 text-[#5D675B]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mt-2">Canonical Master</h3>
            <p className="text-gray-700 font-medium leading-relaxed">
              Consolidate disparate material records into a single, clean canonical code. Preserve historical traceability with source-to-master mappings.
            </p>
          </motion.div>

        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center text-sm text-[#888888] border-t border-[#F0EFED] bg-[var(--bg-main)] mt-auto relative z-10">
        <p className="font-bold text-[var(--text-primary)]">SIH 2026 &copy; Team SyncMasters</p>
        <p className="mt-2 font-medium text-[var(--text-secondary)]">Team Members: Aarav • Harsh • Prachi • Prakul • Priyanshu • Amitabh</p>
      </footer>
    </div>
  );
}
