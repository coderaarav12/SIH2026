const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/LoginPage.tsx', 'utf8');

const newReturn = `  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-4">
      <div className="w-full max-w-[480px] bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col p-8 md:p-12 rounded-[32px] shadow-sm">
        
        <button 
          onClick={onNavigate}
          className="flex items-center gap-2 text-sm text-[#888888] hover:text-[var(--text-primary)] transition-colors w-fit mb-12 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </button>

        <div className="flex-1 flex flex-col justify-center w-full mx-auto">
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
                  placeholder="name@cpse.gov.in"
                  className="w-full pl-12 pr-5 py-4 bg-[var(--bg-alt)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:border-[#5D675B] text-[var(--text-primary)] transition-colors"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
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
          </form>
        </div>
      </div>
    </div>
  );
}
`;

code = code.substring(0, code.indexOf('  return (')) + newReturn;

fs.writeFileSync('frontend/src/components/LoginPage.tsx', code);
console.log('LoginPage updated successfully');
