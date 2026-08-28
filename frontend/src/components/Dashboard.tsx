import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, LogOut, Database, Search, LayoutGrid, FileText, Settings, 
  Activity, Users, CheckCircle, Clock, Palette, ListChecks, History, 
  Network, Link, ScanLine, Upload, FileSignature, AlertCircle, BarChart3, TrendingUp, Menu, X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiUrl } from '../lib/env';
import { useNavigate, useLocation } from 'react-router-dom';

interface DashboardProps {
  onLogout: () => void;
  theme: string;
  setTheme: (theme: string) => void;
}

export default function Dashboard({ onLogout, theme, setTheme }: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() || 'overview';
  const setActiveTab = (tab: string) => {
    navigate(`/dashboard/${tab}`);
    setMobileMenuOpen(false);
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'User', role: 'admin' };
  const canIngest = user && (user.role === 'admin' || user.role === 'officer');

  // UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  
  // Data States
  const [stats, setStats] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [demandPools, setDemandPools] = useState<any[]>([]);
  const [matchingHistory, setMatchingHistory] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);
  const [dedupResults, setDedupResults] = useState<any>(null);
  const [dedupLoading, setDedupLoading] = useState(false);
  const [tenderModal, setTenderModal] = useState<any>(null);
  const [tenderReport, setTenderReport] = useState<string>('');
  const [expandedMaterial, setExpandedMaterial] = useState<any>(null);

  const generateTender = async (pool: any) => {
    setTenderModal(pool);
    setTenderReport('generating');
    try {
       const res = await fetch(apiUrl('/api/reports/generate-tender'), { 
         method: 'POST', 
         headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' }, 
         body: JSON.stringify({ poolData: pool }) 
       });
       const data = await res.json();
       if(data.success) {
         setTenderReport(data.report_html);
       } else {
         setTenderReport('<p class="text-red-500">Error generating report.</p>');
       }
    } catch (e) { 
       setTenderReport('<p class="text-red-500">Error generating report.</p>'); 
    }
  };

  // OCR States
  const [ocrStatus, setOcrStatus] = useState<'idle'|'scanning'|'success'>('idle');
  const [ocrResult, setOcrResult] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        onLogout();
        return;
      }
      const headers = { 'Authorization': 'Bearer ' + token };
      
      try {
        let res;
        if (activeTab === 'overview') {
          res = await fetch(apiUrl('/api/analytics'), { headers });
          if (res.ok) setStats((await res.json()).analytics);
        }
        else if (activeTab === 'materials') {
          res = await fetch(apiUrl('/api/materials?limit=100'), { headers });
          if (res.ok) { const json = await res.json(); setMaterials(json.data || json.materials || json.candidates || []); }
        }
        else if (activeTab === 'procurement') {
          res = await fetch(apiUrl('/api/procurement/demand-pools'), { headers });
          if (res.ok) setDemandPools((await res.json()).pools || []);
        }
        else if (activeTab === 'matching') {
          res = await fetch(apiUrl('/api/matching/history'), { headers });
          if (res.ok) setMatchingHistory((await res.json()).candidates || []);
        }
        else if (activeTab === 'reviews') {
          res = await fetch(apiUrl('/api/reviews'), { headers });
          if (res.ok) setReviews((await res.json()).reviews || []);
        }
        else if (activeTab === 'audit') {
          res = await fetch(apiUrl('/api/audit-logs'), { headers }).catch(() => fetch(apiUrl('/api/audit'), { headers }));
          if (res.ok) setAuditLogs((await res.json()).audit_logs || []);
        }
        else if (activeTab === 'mappings') {
          res = await fetch(apiUrl('/api/mappings'), { headers });
          if (res.ok) setMappings((await res.json()).mappings || []);
        }

        if (res && res.status === 401) {
          localStorage.removeItem('token');
          onLogout();
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, [activeTab, onLogout]);

  
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleRawUpload = async (e: any) => {
    if (!e || !e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      const res = await fetch(apiUrl('/api/materials/upload'), {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
        body: formData
      });
      setUploadResult(await res.json());
    } catch (err) {
      setUploadResult({ success: false, message: 'Upload failed' });
    }
    setIsUploading(false);
    e.target.value = '';
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  const cycleTheme = () => {
    const themes = ['default', 'warm', 'cool', 'dark'];
    const currentIndex = themes.indexOf(theme);
    setTheme(themes[(currentIndex + 1) % themes.length]);
  };

  const handleOcrUpload = async (e?: any) => {
    if (!e || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setOcrStatus('scanning');
    setOcrResult(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(apiUrl('/api/ocr/analyze'), { 
        method: 'POST', 
        headers: { 
          'Authorization': 'Bearer ' + token
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setOcrResult(data.data);
        setOcrStatus('success');
      } else {
        throw new Error(data.message || 'Analysis failed');
      }
    } catch (err) {
      console.error(err);
      setOcrStatus('idle');
      alert('Error analyzing document. Ensure the Mistral API key is valid.');
    }
    
    // Clear input so same file can be uploaded again
    e.target.value = '';
  };

  const exportCSV = () => {
    if (!dedupResults || !dedupResults.duplicates) return;
    const headers = ['Pair ID', 'Confidence', 'Item A (Code)', 'Item A (Name)', 'Item B (Code)', 'Item B (Name)', 'Decision', 'Savings Potential (INR)'];
    const rows = dedupResults.duplicates.map((d: any) => [
      d.pair_id, 
      d.confidence + '%', 
      d.item_a.material_code, 
      `"${d.item_a.material_name}"`, 
      d.item_b.material_code, 
      `"${d.item_b.material_name}"`, 
      d.decision, 
      d.potential_saving_inr
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "deduplication_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] transition-colors duration-300">
      
      {/* Modern Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] p-8 rounded-[32px] shadow-[0_16px_64px_-8px_rgba(0,0,0,0.3)] max-w-[360px] w-full mx-4 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <LogOut className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Sign Out</h3>
              <p className="text-[var(--text-secondary)] mb-8 text-sm font-medium leading-relaxed">
                Are you sure you want to securely end your console session?
              </p>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 px-4 rounded-2xl font-bold border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-alt)] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 py-3 px-4 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all hover:scale-105"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sidebar / Top Navigation Hybrid */}
      <nav className="w-full px-4 md:px-6 py-4 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-card)] transition-colors duration-300 sticky top-0 z-50 shadow-sm relative">
        <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#5D675B] to-[#4E564C] flex items-center justify-center rounded-xl shadow-md">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-[var(--text-primary)] leading-none">SyncMasters</span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mt-1">Material Intelligence</span>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button 
              onClick={cycleTheme}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-alt)] rounded-lg transition-colors border border-[var(--border-color)]"
            >
              <Palette className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[var(--text-primary)] bg-[var(--bg-alt)] rounded-lg border border-[var(--border-color)]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          <div className="hidden lg:flex items-center gap-1 ml-4 bg-[var(--bg-alt)] p-1 rounded-xl border border-[var(--border-color)]">
            {[
              { id: 'overview', icon: LayoutGrid, label: 'Overview' },
              ...(canIngest ? [{ id: 'ingestion', icon: Upload, label: 'Raw Data' }] : []),
              { id: 'matching', icon: Search, label: 'AI Matcher' },
              { id: 'ocr', icon: ScanLine, label: 'OCR Verify' },
              { id: 'mappings', icon: Link, label: 'Harmonized' },
              { id: 'procurement', icon: Network, label: 'Pools' },
              { id: 'materials', icon: Database, label: 'Master Data' },
              { id: 'reviews', icon: ListChecks, label: 'QA' },
              { id: 'audit', icon: History, label: 'Audit' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab.id ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)] ring-1 ring-[var(--border-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'}`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-3 bg-[var(--bg-alt)] border border-[var(--border-color)] pl-2 pr-4 py-1.5 rounded-full">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center">
              <Users className="w-4 h-4 text-[var(--text-secondary)]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-[var(--text-primary)] leading-tight">{user.name}</span>
              <span className="text-[10px] text-[var(--text-secondary)] capitalize font-black tracking-wider leading-none mt-1">{user.role}</span>
            </div>
          </div>
          
          <button 
            onClick={cycleTheme}
            className="p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-alt)] rounded-xl transition-colors border border-transparent hover:border-[var(--border-color)]"
            title="Cycle Theme"
          >
            <Palette className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--stat-red-bg)] text-[var(--stat-red-text)] hover:bg-red-100 dark:hover:bg-red-900 rounded-xl transition-colors font-semibold shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden xl:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-[73px] left-0 right-0 bg-[var(--bg-card)] border-b border-[var(--border-color)] shadow-xl z-40 flex flex-col p-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex flex-col gap-1 mb-4 pb-4 border-b border-[var(--border-color)]">
              <span className="text-sm font-bold text-[var(--text-primary)] px-2">{user.name}</span>
              <span className="text-xs text-[var(--text-secondary)] capitalize font-semibold px-2">{user.role}</span>
            </div>
            
            <div className="flex flex-col gap-2">
              {[
                { id: 'overview', icon: LayoutGrid, label: 'Overview' },
                ...(canIngest ? [{ id: 'ingestion', icon: Upload, label: 'Raw Data' }] : []),
                { id: 'matching', icon: Search, label: 'AI Matcher' },
                { id: 'ocr', icon: ScanLine, label: 'OCR Verify' },
                { id: 'mappings', icon: Link, label: 'Harmonized' },
                { id: 'procurement', icon: Network, label: 'Pools' },
                { id: 'materials', icon: Database, label: 'Master Data' },
                { id: 'reviews', icon: ListChecks, label: 'QA' },
                { id: 'audit', icon: History, label: 'Audit' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${activeTab === tab.id ? 'bg-[#5D675B] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-alt)]'}`}
                >
                  <tab.icon className="w-5 h-5" /> {tab.label}
                </button>
              ))}
            </div>

            <button 
              onClick={() => { setMobileMenuOpen(false); setShowLogoutConfirm(true); }}
              className="mt-6 flex items-center justify-center gap-2 w-full px-4 py-3 bg-[var(--stat-red-bg)] text-[var(--stat-red-text)] rounded-xl transition-colors font-bold shadow-sm"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-[1400px] mx-auto w-full flex flex-col">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight capitalize flex items-center gap-3">
              {activeTab.replace('-', ' ')}
              {activeTab === 'overview' && <span className="flex h-3 w-3 relative ml-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--stat-emerald-bg)] opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--stat-emerald-bg)]"></span></span>}
            </h1>
            <p className="text-[var(--text-secondary)] mt-1 text-sm font-medium">Material Intelligence Portal • Ministry of Petroleum & Natural Gas</p>
          </div>
          
          {activeTab === 'matching' && (
             <button 
                onClick={async () => {
                  setDedupLoading(true);
                  try {
                    const res = await fetch(apiUrl('/api/matching/find-duplicates'), { 
                      method: 'POST', 
                      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } 
                    });
                    const data = await res.json();
                    if (data.success) {
                       setDedupResults(data);
                    }
                  } catch (e) { console.error(e); }
                  setDedupLoading(false);
                }}
                disabled={dedupLoading}
                className="px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-sm font-semibold hover:bg-[#333333] transition-colors shadow-lg shadow-black/10 flex items-center gap-2 disabled:opacity-50"
              >
                {dedupLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Search className="w-4 h-4" />}
                {dedupLoading ? 'Scanning Catalog...' : 'Run Catalog Deduplication'}
              </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            {/* 1. Detailed Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="flex flex-col gap-6">
                
                {/* Top KPI Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Catalog Size', value: stats.total_materials?.toLocaleString(), icon: Database, color: 'text-[var(--stat-blue-text)]', bg: 'bg-[var(--stat-blue-bg)]', border: 'border-[var(--stat-blue-text)]', trend: '+12% MTD', target: 'materials' },
                    { label: 'Duplicate Candidates', value: stats.total_match_candidates?.toLocaleString(), icon: Activity, color: 'text-[var(--stat-purple-text)]', bg: 'bg-[var(--stat-purple-bg)]', border: 'border-[var(--stat-purple-text)]', trend: `${stats.pending_review} pending`, target: 'matching' },
                    { label: 'Harmonized Mappings', value: stats.mappings_count?.toLocaleString(), icon: Link, color: 'text-[var(--stat-emerald-text)]', bg: 'bg-[var(--stat-emerald-bg)]', border: 'border-[var(--stat-emerald-text)]', trend: `${stats.harmonization_rate || 0}% coverage`, target: 'mappings' },
                    { label: 'Cost Savings (INR)', value: `₹ ${((stats.estimated_savings_inr || 0) / 100000).toFixed(2)} L`, icon: TrendingUp, color: 'text-[var(--stat-amber-text)]', bg: 'bg-[var(--stat-amber-bg)]', border: 'border-[var(--stat-amber-text)]', trend: 'Projected', target: 'procurement' }
                  ].map((s, i) => (
                    <div 
                      key={i} 
                      onClick={() => setActiveTab(s.target)}
                      className="bg-[var(--bg-card)] p-6 rounded-[24px] border border-[var(--border-color)] shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className={`p-3 rounded-2xl ${s.bg} ${s.border} border group-hover:scale-110 transition-transform`}>
                          <s.icon className={`w-6 h-6 ${s.color}`} />
                        </div>
                        <span className="text-[11px] font-bold text-[var(--text-secondary)] bg-[var(--bg-alt)] px-2.5 py-1 rounded-full border border-[var(--border-color)]">{s.trend}</span>
                      </div>
                      <div className="text-3xl font-black text-[var(--text-primary)] mb-1 tracking-tight relative z-10">{s.value}</div>
                      <div className="text-sm font-semibold text-[var(--text-secondary)] relative z-10">{s.label}</div>
                      <div className={`absolute -right-8 -bottom-8 w-32 h-32 ${s.bg} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl`}></div>
                    </div>
                  ))}
                </div>

                {/* Middle Row: AI Funnel & Activity Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   {/* Funnel */}
                   <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] p-6 shadow-sm flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-[var(--text-primary)] text-lg flex items-center gap-2">
                          <Activity className="w-5 h-5 text-indigo-500" /> AI Processing Funnel
                        </h3>
                      </div>
                      <div className="flex-1 flex flex-col justify-center gap-4">
                        {(() => {
                          const maxVal = Math.max(1, stats.total_match_candidates || 1);
                          return [
                            { step: 'Raw Uploads', val: stats.total_match_candidates, c: 'bg-[var(--stat-purple-bg)] text-[var(--stat-purple-text)]' },
                            { step: 'Auto-Suggested', val: stats.auto_suggestions, c: 'bg-[var(--stat-blue-bg)] text-[var(--stat-blue-text)]' },
                            { step: 'Pending Review', val: stats.pending_review, c: 'bg-[var(--stat-amber-bg)] text-[var(--stat-amber-text)]' },
                            { step: 'Approved Mappings', val: stats.approved, c: 'bg-[var(--stat-emerald-bg)] text-[var(--stat-emerald-text)]' }
                          ].map((f, i) => {
                            const widthPercent = (f.val / maxVal) * 100;
                            return (
                              <div key={i} className="relative w-full">
                                <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)] mb-1.5 px-1">
                                  <span>{f.step}</span>
                                  <span>{f.val} items</span>
                                </div>
                                <div className="h-8 bg-[var(--bg-alt)] rounded-lg overflow-hidden border border-[var(--border-color)] p-0.5">
                                  <div className={`h-full rounded-md flex items-center justify-end px-3 text-xs font-black transition-all duration-1000 ${f.c}`} style={{ width: `${Math.max(2, widthPercent)}%` }}>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                   </div>

                   {/* Chart */}
                   <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-[var(--text-primary)] text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[var(--stat-blue-text)]" /> Material Onboarding Trends</h3>
                        <div className="flex gap-2">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> AI Matches</span>
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Approved</span>
                        </div>
                      </div>
                      <div className="h-[220px] flex items-end gap-3 px-2 pb-6 border-b border-[var(--border-color)] relative">
                         <div className="absolute inset-0 flex flex-col justify-between pb-6">
                           {[100, 75, 50, 25, 0].map(y => (
                             <div key={y} className="w-full border-b border-dashed border-[var(--border-color)] h-0 flex items-center"><span className="text-[10px] font-medium text-[var(--text-secondary)] bg-[var(--bg-card)] pr-2 -translate-y-1/2 w-8 text-right">{y}</span></div>
                           ))}
                         </div>
                         {/* Dynamic Chart Bars based on mock array or stats.trends */}
                         {(stats.trends || [ {m: 45, a: 30}, {m: 60, a: 45}, {m: 35, a: 25}, {m: 85, a: 60}, {m: 55, a: 40}, {m: 90, a: 75}, {m: 75, a: 50} ]).map((d: any, i: number) => (
                           <div key={i} className="flex-1 flex items-end justify-center gap-1 relative z-10 h-full pt-4">
                              <div className="w-1/2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors rounded-t-md relative group" style={{ height: `${d.m}%` }}>
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[var(--text-primary)] text-[var(--bg-main)] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 shadow-md font-bold">{d.m}</div>
                              </div>
                              <div className="w-1/2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors rounded-t-md relative group" style={{ height: `${d.a}%` }}>
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[var(--text-primary)] text-[var(--bg-main)] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 shadow-md font-bold">{d.a}</div>
                              </div>
                           </div>
                         ))}
                      </div>
                      <div className="flex justify-between px-10 pt-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                      </div>
                   </div>
                </div>

                {/* Bottom Row: Category Breakdown & Activity Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Categories */}
                  <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] p-6 shadow-sm">
                    <h3 className="font-bold text-[var(--text-primary)] text-lg mb-6 flex items-center gap-2"><Database className="w-5 h-5 text-[var(--stat-purple-text)]" /> Top Categories</h3>
                    <div className="space-y-4">
                      {stats.categories && stats.categories.length > 0 ? stats.categories.slice(0, 5).map((c:any, i:number) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-alt)] border border-[var(--border-color)] flex items-center justify-center text-xs font-black text-[var(--text-secondary)]">{i+1}</div>
                            <span className="font-semibold text-sm text-[var(--text-primary)]">{c.category || 'Standard'}</span>
                          </div>
                          <span className="text-sm font-bold text-[var(--text-secondary)]">{c.count} items</span>
                        </div>
                      )) : (
                        <div className="text-sm text-[var(--text-secondary)] text-center py-4">No categories data</div>
                      )}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="lg:col-span-2 bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-[var(--text-primary)] text-lg flex items-center gap-2"><History className="w-5 h-5 text-[var(--stat-emerald-text)]" /> Recent System Activity</h3>
                      <button onClick={() => setActiveTab('audit')} className="text-sm font-semibold text-[var(--stat-blue-text)] hover:underline">View All Logs</button>
                    </div>
                    <div className="space-y-4">
                      {stats.recent_activity && stats.recent_activity.length > 0 ? stats.recent_activity.slice(0, 4).map((act:any, i:number) => (
                        <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-[var(--bg-alt)] transition-colors">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
                            act.action.includes('APPROVE') ? 'bg-[var(--stat-emerald-bg)] text-[var(--stat-emerald-text)] border-[var(--stat-emerald-text)]' :
                            act.action.includes('REJECT') ? 'bg-[var(--stat-red-bg)] text-[var(--stat-red-text)] border-[var(--stat-red-text)]' :
                            'bg-[var(--stat-blue-bg)] text-[var(--stat-blue-text)] border-[var(--stat-blue-text)]'
                          }`}>
                            {act.action.includes('APPROVE') ? <CheckCircle className="w-5 h-5"/> : 
                             act.action.includes('REJECT') ? <AlertCircle className="w-5 h-5"/> : <Activity className="w-5 h-5"/>}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-[var(--text-primary)] text-sm mb-0.5">{act.action.replace(/_/g, ' ')}</div>
                            <div className="text-xs text-[var(--text-secondary)] leading-relaxed">User <span className="font-semibold">{act.user_name}</span> processed <span className="font-semibold">{act.entity_type}</span> #{act.entity_id}.</div>
                          </div>
                          <div className="text-[10px] font-bold text-[var(--text-secondary)] whitespace-nowrap bg-[var(--bg-card)] px-2 py-1 rounded border border-[var(--border-color)]">
                            {new Date(act.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      )) : (
                         <div className="text-sm text-[var(--text-secondary)] text-center py-8">No recent activity found.</div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 2. AI Matching History */}
            {activeTab === 'matching' && (
              <div className="flex flex-col gap-6">
                
                {dedupResults && (
                  <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] shadow-sm overflow-hidden flex flex-col mb-2">
                    <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center justify-between">
                       <div>
                         <h3 className="font-bold text-[var(--text-primary)] text-lg">Deduplication Cluster Report</h3>
                         <p className="text-sm text-[var(--text-secondary)] font-medium mt-0.5">Found {dedupResults.duplicates_found_count} potential duplicates out of {dedupResults.scanned_materials_count} materials.</p>
                       </div>
                       <button onClick={exportCSV} className="px-4 py-2 bg-[var(--stat-blue-bg)] text-[var(--stat-blue-text)] border border-[var(--stat-blue-text)] rounded-xl font-bold hover:opacity-80 transition-opacity">
                         Export CSV
                       </button>
                    </div>
                    <div className="overflow-x-auto max-h-[400px]">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-[var(--bg-alt)] sticky top-0">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Item A</th>
                            <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Item B</th>
                            <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Similarity</th>
                            <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Est. Savings</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                          {dedupResults.duplicates.map((d: any, i: number) => (
                            <tr key={i} className="hover:bg-[var(--bg-alt)] transition-colors cursor-pointer">
                              <td className="px-6 py-4">
                                <div className="font-bold text-[var(--text-primary)] text-sm">{d.item_a.material_code}</div>
                                <div className="text-xs text-[var(--text-secondary)] truncate max-w-[200px] mt-1">{d.item_a.material_name}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-bold text-[var(--text-primary)] text-sm">{d.item_b.material_code}</div>
                                <div className="text-xs text-[var(--text-secondary)] truncate max-w-[200px] mt-1">{d.item_b.material_name}</div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--stat-amber-bg)] text-[var(--stat-amber-text)] border border-[var(--stat-amber-text)] font-bold">
                                  {d.confidence}%
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                                ₹{(d.potential_saving_inr / 100000).toFixed(2)}L
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] shadow-sm overflow-hidden flex flex-col">
                  <div className="px-6 py-5 border-b border-[var(--border-color)] bg-[var(--bg-alt)]">
                     <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider">Semantic Matching History</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[var(--bg-alt)]">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Input Text</th>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Matched Canonical Material</th>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Similarity</th>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Engine Decision</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {matchingHistory.length ? matchingHistory.map((m, i) => (
                        <tr key={i} className="hover:bg-[var(--bg-alt)] transition-colors cursor-pointer">
                          <td className="px-6 py-4 text-sm font-semibold text-[var(--text-primary)] max-w-[250px] truncate">{m.input_text}</td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary)] max-w-[250px] truncate">{m.material_name}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--stat-emerald-bg)] text-[var(--stat-emerald-text)] border border-[var(--stat-emerald-text)] font-bold">
                              {m.score.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <span className={`px-2.5 py-1 font-bold rounded-md uppercase tracking-wider ${m.decision === 'approved' ? 'bg-[var(--stat-emerald-bg)] text-[var(--stat-emerald-text)]' : m.decision === 'review' ? 'bg-[var(--stat-amber-bg)] text-[var(--stat-amber-text)]' : 'bg-gray-100 text-gray-800'}`}>
                              {m.decision.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      )) : <tr><td colSpan={4} className="p-8 text-center text-[var(--text-secondary)]">No AI matches recorded yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            )}

            {/* 3. OCR Verification */}
            {activeTab === 'ocr' && (
              <div className="flex gap-8">
                <div className="w-1/3 bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] p-8 shadow-sm flex flex-col items-center justify-center text-center">
                   <div className="w-20 h-20 bg-[var(--stat-blue-bg)] text-[var(--stat-blue-text)] rounded-full flex items-center justify-center mb-6 border border-[var(--stat-blue-text)] shadow-sm">
                     <FileSignature className="w-10 h-10" />
                   </div>
                   <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Invoice / Label Extraction</h2>
                   <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed">Upload a PO, Invoice, or Material Label. Our Vision AI will extract specs and run it through the Semantic Matcher automatically.</p>
                   
                   <label className="w-full py-4 bg-[#1A1A1A] text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#333333] transition-colors cursor-pointer disabled:opacity-50">
                     <input type="file" className="hidden" onChange={handleOcrUpload} accept="image/*,.pdf,.txt" />
                     {ocrStatus === 'scanning' ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Upload className="w-5 h-5" />}
                     {ocrStatus === 'scanning' ? 'Analyzing Document...' : 'Upload & Analyze Document'}
                   </label>
                </div>

                <div className="flex-1 bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] p-8 shadow-sm">
                  {ocrStatus === 'idle' && (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-50">
                       <ScanLine className="w-16 h-16 mb-4" />
                       <p className="font-semibold">Results will appear here</p>
                    </div>
                  )}
                  {ocrStatus === 'scanning' && (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)]">
                       <div className="w-16 h-16 border-4 border-[var(--border-color)] border-t-[#5D675B] rounded-full animate-spin mb-4"></div>
                       <p className="font-semibold animate-pulse">Running OCR and NLP Extraction...</p>
                    </div>
                  )}
                  {ocrStatus === 'success' && ocrResult && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                       <div className="flex items-center justify-between mb-6 pb-6 border-b border-[var(--border-color)]">
                         <h3 className="text-xl font-bold text-[var(--text-primary)]">Extraction Complete</h3>
                         <span className="px-3 py-1 bg-[var(--stat-emerald-bg)] text-[var(--stat-emerald-text)] font-bold rounded-lg text-sm border border-[var(--stat-emerald-text)]">Confidence: {ocrResult.confidence_score}%</span>
                       </div>
                       
                       <div className="bg-[var(--bg-alt)] p-4 rounded-xl border border-[var(--border-color)] mb-6 font-mono text-sm text-[var(--text-primary)]">
                         <div className="text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-2">Raw Text Stream</div>
                         "{ocrResult.raw_text}"
                       </div>

                       <div className="grid grid-cols-2 gap-4 mb-8">
                         {Object.entries(ocrResult.extracted_fields).map(([k, v]) => (
                           <div key={k} className="p-4 border border-[var(--border-color)] rounded-xl">
                             <div className="text-xs uppercase font-bold text-[var(--text-secondary)] mb-1">{k.replace('_', ' ')}</div>
                             <div className="font-semibold text-[var(--text-primary)]">{v as React.ReactNode}</div>
                           </div>
                         ))}
                       </div>

                       <div className="mt-auto p-5 bg-[var(--stat-blue-bg)] border border-[var(--stat-blue-text)] rounded-xl">
                         <div className="text-xs uppercase font-bold text-[var(--stat-blue-text)] mb-1">Recommended Canonical Match</div>
                         <div className="font-bold text-lg text-[var(--stat-blue-text)]">{ocrResult.recommended_canonical_name}</div>
                       </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Harmonized Mappings */}
            {activeTab === 'mappings' && (
               <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[var(--bg-alt)]">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Source Text / Code</th>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)] text-center">Mapping</th>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Canonical Standard</th>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Category / Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {mappings.length ? mappings.map((m, i) => (
                        <tr key={i} className="hover:bg-[var(--bg-alt)] transition-colors cursor-pointer">
                          <td className="px-6 py-4">
                            <div className="font-bold text-[var(--text-primary)] text-sm">{m.source_code}</div>
                            <div className="text-xs text-[var(--text-secondary)] truncate max-w-[200px] mt-1">{m.source_name}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Link className="w-5 h-5 mx-auto text-[#5D675B]" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-[var(--text-primary)] text-sm">{m.canonical_code}</div>
                            <div className="text-xs text-[var(--text-secondary)] truncate max-w-[250px] mt-1">{m.canonical_name}</div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-[var(--text-secondary)]">
                            <div className="flex gap-2">
                               <span className="bg-[var(--bg-main)] px-2 py-1 rounded border border-[var(--border-color)]">{m.canonical_category}</span>
                               <span className="bg-[var(--bg-main)] px-2 py-1 rounded border border-[var(--border-color)]">{m.canonical_grade}</span>
                            </div>
                          </td>
                        </tr>
                      )) : <tr><td colSpan={4} className="p-8 text-center text-[var(--text-secondary)]">No mappings approved yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. Procurement Demand Pools */}
            {activeTab === 'procurement' && (
              <div className="grid gap-6">
                {demandPools.length ? demandPools.map((p, i) => (
                  <div key={i} className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] shadow-sm p-6 lg:p-8 flex flex-col lg:flex-row gap-8 transition-shadow hover:shadow-md">
                     <div className="flex-1">
                       <div className="flex items-center gap-3 mb-2">
                         <span className="px-3 py-1 bg-[var(--stat-amber-bg)] text-[var(--stat-amber-text)] text-xs font-bold rounded-lg border border-[var(--stat-amber-text)]">{p.id}</span>
                         <span className="text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-alt)] px-2 py-1 rounded-md">{p.category}</span>
                       </div>
                       <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">{p.canonical_name}</h3>
                       
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                         <div className="p-3 bg-[var(--bg-alt)] rounded-xl border border-[var(--border-color)]">
                           <div className="text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Standard Price</div>
                           <div className="font-bold text-[var(--text-primary)]">₹{p.standard_unit_price}</div>
                         </div>
                         <div className="p-3 bg-[var(--stat-emerald-bg)] rounded-xl border border-[var(--stat-emerald-text)]">
                           <div className="text-[10px] uppercase font-bold text-[var(--stat-emerald-text)] mb-1">Pooled Price</div>
                           <div className="font-bold text-[var(--stat-emerald-text)]">₹{p.pooled_unit_price}</div>
                         </div>
                         <div className="p-3 bg-[var(--bg-alt)] rounded-xl border border-[var(--border-color)]">
                           <div className="text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Total Demand</div>
                           <div className="font-bold text-[var(--text-primary)]">{p.total_demand.toLocaleString()} {p.unit}</div>
                         </div>
                         <div className="p-3 bg-[var(--stat-emerald-bg)] rounded-xl border border-[var(--stat-emerald-text)]">
                           <div className="text-[10px] uppercase font-bold text-[var(--stat-emerald-text)] mb-1">Est. Savings</div>
                           <div className="font-bold text-[var(--stat-emerald-text)]">₹ {(p.estimated_savings_inr / 100000).toFixed(2)} L</div>
                         </div>
                       </div>
                     </div>

                     <div className="lg:w-1/3 bg-[var(--bg-alt)] rounded-[20px] p-6 border border-[var(--border-color)] flex flex-col justify-center">
                       <h4 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-[var(--text-secondary)]"/> Participating CPSEs</h4>
                       <div className="space-y-3">
                         {p.participating_cpses.map((cpse:any, j:number) => (
                           <div key={j} className="flex justify-between items-center text-sm border-b border-[var(--border-color)] pb-2 last:border-0 last:pb-0">
                             <div className="font-medium text-[var(--text-primary)]">{cpse.cpse}</div>
                             <div className="text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-card)] px-2 py-1 rounded-md">{cpse.quantity.toLocaleString()} {p.unit}</div>
                           </div>
                         ))}
                       </div>
                       <button onClick={() => generateTender(p)} className="mt-5 w-full py-2 bg-[var(--text-primary)] text-white rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                         <FileSignature className="w-4 h-4" /> Generate AI Tender Report
                       </button>
                     </div>
                  </div>
                )) : <div className="p-8 text-center bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] text-[var(--text-secondary)]">No demand pools active.</div>}
              </div>
            )}

            
              {/* Raw Data Ingestion Tab */}
              {activeTab === 'ingestion' && canIngest && (
                <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] p-8 shadow-sm max-w-3xl mx-auto">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-[var(--stat-purple-bg)] text-[var(--stat-purple-text)] rounded-xl border border-[var(--stat-purple-text)]">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[var(--text-primary)]">Raw Material Ingestion</h2>
                      <p className="text-sm text-[var(--text-secondary)]">Secure upload portal for raw CPSE catalogs (.csv, .xlsx)</p>
                    </div>
                  </div>
                  <div className="border-2 border-dashed border-[var(--border-color)] rounded-2xl p-12 text-center bg-[var(--bg-alt)] hover:bg-[var(--bg-main)] transition-colors">
                    <Upload className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Select Catalog File</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-6">File limit: 10MB. Must contain material descriptions.</p>
                    <label className="inline-flex px-6 py-3 bg-[var(--text-primary)] text-white font-bold rounded-xl shadow-sm hover:opacity-90 cursor-pointer transition-opacity">
                      <input type="file" className="hidden" accept=".csv,.xlsx" onChange={handleRawUpload} disabled={isUploading} />
                      {isUploading ? 'Uploading & Parsing...' : 'Browse Local Files'}
                    </label>
                  </div>
                  
                  {uploadResult && (
                    <div className={"mt-6 p-4 rounded-xl border " + (uploadResult.success ? "bg-[var(--stat-emerald-bg)] text-[var(--stat-emerald-text)] border-[var(--stat-emerald-text)]" : "bg-[var(--stat-red-bg)] text-[var(--stat-red-text)] border-[var(--stat-red-text)]")}>
                       <h4 className="font-bold mb-1">{uploadResult.success ? 'Ingestion Successful' : 'Ingestion Failed'}</h4>
                       <p className="text-sm opacity-90">{uploadResult.message}</p>
                       {uploadResult.success && <div className="mt-2 text-xs font-bold opacity-80">Total Parsed: {uploadResult.total_rows} | Inserted: {uploadResult.inserted} | Skipped: {uploadResult.skipped}</div>}
                    </div>
                  )}
                </div>
              )}

              {/* 6. Materials / Master Data */}
            {activeTab === 'materials' && (
              <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] shadow-sm overflow-hidden flex flex-col h-full">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[var(--bg-alt)]">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Material Code</th>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Canonical Description</th>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Group / Category</th>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Grade & Size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {materials.length ? materials.map((m, i) => (
                        <tr key={i} onClick={() => setExpandedMaterial(m)} className="hover:bg-[var(--bg-alt)] transition-colors cursor-pointer">
                          <td className="px-6 py-4 font-bold text-[var(--text-primary)] text-sm">{m.material_code || m.id}</td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary)] font-medium max-w-[350px]">{m.material_name || m.description}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold bg-[var(--bg-alt)] border border-[var(--border-color)] px-2.5 py-1 rounded-md text-[var(--text-primary)]">{m.group_code || m.category || 'Standard'}</span>
                          </td>
                          <td className="px-6 py-4 text-xs text-[var(--text-secondary)]">
                            <div className="flex flex-col gap-1">
                              {m.grade && <span><strong className="text-[var(--text-primary)]">Gr:</strong> {m.grade}</span>}
                              {m.size && <span><strong className="text-[var(--text-primary)]">Sz:</strong> {m.size}</span>}
                              {!m.grade && !m.size && <span>-</span>}
                            </div>
                          </td>
                        </tr>
                      )) : <tr><td colSpan={4} className="p-8 text-center text-[var(--text-secondary)]">Loading catalog...</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 7. QA Reviews */}
            {activeTab === 'reviews' && (
              <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[var(--bg-alt)]">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Source Requisition</th>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Mapped Canonical Code</th>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">QA Decision</th>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Reviewer Name</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {reviews.length ? reviews.map((r, i) => (
                        <tr key={i} className="hover:bg-[var(--bg-alt)] transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-[var(--text-primary)]">{r.input_text}</td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-[var(--text-primary)]">{r.material_code}</div>
                            <div className="text-xs text-[var(--text-secondary)] max-w-[200px] truncate mt-1">{r.material_name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md border ${r.action === 'approve' ? 'bg-green-50 text-[var(--stat-emerald-text)] border-[var(--stat-emerald-text)]' : 'bg-[var(--stat-red-bg)] text-[var(--stat-red-text)] border-[var(--stat-red-text)]'}`}>
                              {r.action === 'approve' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {r.action.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary)] font-medium">{r.reviewer_name}</td>
                        </tr>
                      )) : <tr><td colSpan={4} className="p-8 text-center text-[var(--text-secondary)]">No reviews found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 8. Audit Logs */}
            {activeTab === 'audit' && (
              <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[var(--bg-alt)]">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Timestamp</th>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">System Action</th>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Executing User</th>
                        <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)]">Entity / Target</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {auditLogs.length ? auditLogs.map((a, i) => (
                        <tr key={i} className="hover:bg-[var(--bg-alt)] transition-colors">
                          <td className="px-6 py-4 text-xs font-medium text-[var(--text-secondary)]">{new Date(a.created_at).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold bg-[var(--bg-alt)] text-[var(--text-primary)] border border-[var(--border-color)] px-2 py-1 rounded-md">
                              {a.action}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-[var(--text-primary)]">{a.user_name}</div>
                            <div className="text-xs text-[var(--text-secondary)] mt-0.5">{a.user_dept} • {a.user_role}</div>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-[var(--text-secondary)]">
                            {a.entity_type} <span className="text-[var(--stat-blue-text)] font-bold ml-1">#{a.entity_id}</span>
                          </td>
                        </tr>
                      )) : <tr><td colSpan={4} className="p-8 text-center text-[var(--text-secondary)]">No audit trails recorded.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* AI Tender Generation Modal */}
        <AnimatePresence>
          {tenderModal && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-[var(--bg-card)] rounded-[24px] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[var(--border-color)]">
                 <div className="px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-alt)]">
                    <div>
                      <h2 className="font-bold text-xl text-[var(--text-primary)]">AI Tender Generation</h2>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{tenderModal.canonical_name}</p>
                    </div>
                    <button onClick={() => setTenderModal(null)} className="w-8 h-8 flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full hover:bg-[var(--bg-alt)] transition-colors"><X className="w-4 h-4 text-[var(--text-secondary)]"/></button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-8 relative">
                    {tenderReport === 'generating' ? (
                       <div className="flex flex-col items-center justify-center h-full space-y-4 min-h-[300px]">
                         <div className="w-12 h-12 border-4 border-[var(--stat-blue-text)] border-t-transparent rounded-full animate-spin"></div>
                         <p className="font-bold text-[var(--text-secondary)] animate-pulse">Mistral AI is drafting the Government RFP...</p>
                       </div>
                    ) : (
                       <div className="tender-report text-[var(--text-primary)]" dangerouslySetInnerHTML={{__html: tenderReport}}></div>
                    )}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detailed Material Modal */}
        <AnimatePresence>
          {expandedMaterial && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-[var(--bg-card)] rounded-[24px] w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl border border-[var(--border-color)]">
                 <div className="px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-alt)]">
                    <div>
                      <h2 className="font-bold text-xl text-[var(--text-primary)]">{expandedMaterial.material_code}</h2>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 uppercase tracking-wider">{expandedMaterial.category}</p>
                    </div>
                    <button onClick={() => setExpandedMaterial(null)} className="w-8 h-8 flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full hover:bg-[var(--bg-alt)] transition-colors"><X className="w-4 h-4 text-[var(--text-secondary)]"/></button>
                 </div>
                 <div className="p-8">
                    <h3 className="text-2xl font-black text-[var(--text-primary)] mb-6">{expandedMaterial.material_name}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-[var(--bg-alt)] p-4 rounded-xl border border-[var(--border-color)]">
                        <div className="text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Standard / Grade</div>
                        <div className="font-semibold text-[var(--text-primary)]">{expandedMaterial.grade || 'N/A'}</div>
                      </div>
                      <div className="bg-[var(--bg-alt)] p-4 rounded-xl border border-[var(--border-color)]">
                        <div className="text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Size / Dimension</div>
                        <div className="font-semibold text-[var(--text-primary)]">{expandedMaterial.size || 'N/A'} {expandedMaterial.unit || ''}</div>
                      </div>
                      <div className="bg-[var(--bg-alt)] p-4 rounded-xl border border-[var(--border-color)]">
                        <div className="text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">Compliance Standard</div>
                        <div className="font-semibold text-[var(--text-primary)]">{expandedMaterial.compliance_standard || 'IS / ISO Guidelines'}</div>
                      </div>
                      <div className="bg-[var(--bg-alt)] p-4 rounded-xl border border-[var(--border-color)]">
                        <div className="text-[10px] uppercase font-bold text-[var(--text-secondary)] mb-1">HSN Code</div>
                        <div className="font-semibold text-[var(--text-primary)]">{expandedMaterial.hsn_code || 'TBD'}</div>
                      </div>
                    </div>

                    <div className="bg-[var(--stat-blue-bg)] border border-[var(--stat-blue-text)] p-4 rounded-xl mb-4">
                      <div className="text-xs uppercase font-bold text-[var(--stat-blue-text)] mb-2">Technical Specifications</div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{expandedMaterial.technical_specs || 'Standard OEM specifications apply.'}</div>
                    </div>
                    
                    <div className="bg-[var(--stat-amber-bg)] border border-[var(--stat-amber-text)] p-4 rounded-xl">
                      <div className="text-xs uppercase font-bold text-[var(--stat-amber-text)] mb-2">Manufacturer Guidelines</div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{expandedMaterial.manufacturer_guidelines || 'Follow standard operating and installation procedures.'}</div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
