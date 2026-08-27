import { motion } from 'motion/react';
import { ArrowRight, Box, CheckCircle, Database, Search, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onNavigate: () => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white/30 backdrop-blur-sm">
      {/* Navigation */}
      <nav className="w-full px-6 md:px-12 py-4 lg:py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#5D675B] flex items-center justify-center rounded-full">
            <Box className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-xl tracking-tight text-[var(--text-primary)]">SyncMasters</span>
        </div>
        <button
          onClick={onNavigate}
          className="text-sm font-medium text-[var(--text-primary)] hover:text-[#5D675B] transition-colors"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-6 lg:py-4 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block px-4 py-1.5 bg-[#EAE7E2] text-[#5D675B] text-xs font-semibold uppercase tracking-[0.1em] rounded-full mb-4 lg:mb-6 w-fit mx-auto"
        >
          <span>SIH 2026 Project</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[32px] md:text-[48px] lg:text-[56px] font-medium leading-[1.1] text-[var(--text-primary)] -tracking-[0.03em] font-serif mb-4"
        >
          Material Intelligence for <br className="hidden md:block" />
          Modern CPSEs
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base md:text-lg text-[var(--text-secondary)] mb-6 lg:mb-8 max-w-2xl leading-relaxed"
        >
          AI-driven standardisation and harmonization of material codes. 
          Eliminate duplicates, improve inventory visibility, and streamline procurement.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 lg:gap-4"
        >
          <button 
            onClick={onNavigate}
            className="flex items-center justify-center gap-2 px-6 py-3 lg:px-8 lg:py-4 bg-[var(--text-primary)] text-white rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Access Platform
            <ArrowRight className="w-4 h-4" />
          </button>
          <a href="https://coderaarav12.github.io/SIH2026/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 py-3 lg:px-8 lg:py-4 border border-[#DEDBD5] text-[var(--text-primary)] rounded-full font-medium hover:bg-[#F5F2ED] transition-colors">
            Read Documentation
          </a>
        </motion.div>
      </main>

      {/* Feature Grid */}
      <section className="py-8 lg:py-6 pb-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-3 p-6 lg:p-8 bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.05)]"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/80 border border-white/50 rounded-2xl flex items-center justify-center shadow-sm">
              <Search className="w-5 h-5 lg:w-6 lg:h-6 text-[#5D675B]" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-[var(--text-primary)] mt-1">Semantic AI Matching</h3>
            <p className="text-sm lg:text-base text-[var(--text-secondary)] leading-relaxed">
              Understands material names semantically to detect equivalents across varying nomenclatures, expanding abbreviations and normalizing units automatically.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-3 p-6 lg:p-8 bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.05)]"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/80 border border-white/50 rounded-2xl flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 lg:w-6 lg:h-6 text-[#5D675B]" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-[var(--text-primary)] mt-1">Human-in-the-Loop</h3>
            <p className="text-sm lg:text-base text-[var(--text-secondary)] leading-relaxed">
              High-confidence matches are auto-suggested, while borderline cases are routed to human reviewers. Every decision is recorded in a secure audit trail.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-3 p-6 lg:p-8 bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.05)]"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/80 border border-white/50 rounded-2xl flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5 lg:w-6 lg:h-6 text-[#5D675B]" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-[var(--text-primary)] mt-1">Canonical Master</h3>
            <p className="text-sm lg:text-base text-[var(--text-secondary)] leading-relaxed">
              Consolidate disparate material records into a single, clean canonical code. Preserve historical traceability with source-to-master mappings.
            </p>
          </motion.div>

        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-4 lg:py-6 text-center text-xs lg:text-sm text-[#888888] border-t border-[#F0EFED] bg-[var(--bg-main)] mt-auto relative z-10">
        <p className="font-bold text-[var(--text-primary)]">SIH 2026 &copy; Team SyncMasters</p>
        <p className="mt-1 lg:mt-2 font-medium text-[var(--text-secondary)]">Team Members: Aarav • Harsh • Prachi • Prakul • Priyanshu • Amitabh</p>
      </footer>
    </div>
  );
}
