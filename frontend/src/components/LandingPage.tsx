import { motion } from 'motion/react';
import { ArrowRight, Box, CheckCircle, Database, Search, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onNavigate: () => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white/50 backdrop-blur-sm">
      {/* Navigation */}
      <nav className="w-full px-6 md:px-12 py-8 flex items-center justify-between">
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
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block px-4 py-1.5 bg-[#EAE7E2] text-[#5D675B] text-xs font-semibold uppercase tracking-[0.1em] rounded-full mb-8 w-fit mx-auto"
        >
          <span>SIH 2026 Project</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[40px] md:text-[56px] lg:text-[64px] font-medium leading-[1.1] text-[var(--text-primary)] -tracking-[0.03em] font-serif mb-6"
        >
          Material Intelligence for <br className="hidden md:block" />
          Modern CPSEs
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl leading-relaxed"
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
            className="flex items-center justify-center gap-2 px-8 py-4 bg-[var(--text-primary)] text-white rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Access Platform
            <ArrowRight className="w-4 h-4" />
          </button>
          <a href="https://coderaarav12.github.io/SIH2026/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-8 py-4 border border-[#DEDBD5] text-[var(--text-primary)] rounded-full font-medium hover:bg-[#F5F2ED] transition-colors">
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
            className="flex flex-col gap-4"
          >
            <div className="w-12 h-12 bg-[var(--bg-alt)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center">
              <Search className="w-6 h-6 text-[#5D675B]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">Semantic AI Matching</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Understands material names semantically to detect equivalents across varying nomenclatures, expanding abbreviations and normalizing units automatically.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <div className="w-12 h-12 bg-[var(--bg-alt)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#5D675B]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">Human-in-the-Loop</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              High-confidence matches are auto-suggested, while borderline cases are routed to human reviewers. Every decision is recorded in a secure audit trail.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            <div className="w-12 h-12 bg-[var(--bg-alt)] border border-[var(--border-color)] rounded-2xl flex items-center justify-center">
              <Database className="w-6 h-6 text-[#5D675B]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">Canonical Master</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
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
