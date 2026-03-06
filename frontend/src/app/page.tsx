import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-white font-display text-gray-900">
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-gray-200 bg-white/80 backdrop-blur-md px-10 py-4 w-full">
        <div className="flex items-center gap-4">
          <div className="text-primary">
            <span className="material-symbols-outlined text-2xl">hub</span>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">Markhub</h2>
        </div>
        <div className="hidden md:flex flex-1 justify-end gap-8">
          <nav className="flex items-center gap-8">
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">Product</Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">Features</Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">Pricing</Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">About</Link>
          </nav>
          <div className="flex gap-3">
            <button className="flex items-center justify-center rounded-lg h-10 px-5 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold transition-colors border border-gray-200">
              Sign In
            </button>
            <Link href="/onboarding/step1" className="flex items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-[0_0_15px_rgba(38,108,237,0.4)] transition-transform hover:scale-105 duration-300">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-32 w-full">
          <div className="flex-1 flex flex-col gap-8 text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 w-fit">
              <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
              <span className="text-xs font-semibold text-primary tracking-wide uppercase">AI Career OS 2.0 Live</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight text-gray-900 animate-fade-in">
              Your Career.<br />Powered by AI.
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 max-w-xl leading-relaxed">
              Unlock your potential with Markhub, the elite AI Career OS for university students. Discover hidden opportunities, conquer skill gaps, and deploy auto-portfolios seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/onboarding/step1" className="flex items-center justify-center rounded-lg h-14 px-8 bg-primary hover:bg-primary/90 text-white text-base font-bold shadow-[0_0_20px_rgba(38,108,237,0.5)] transition-transform hover:scale-105 duration-300 gap-2 group">
                Initialize Markhub AI
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <button className="flex items-center justify-center rounded-lg h-14 px-8 bg-gray-100 hover:bg-gray-200 text-gray-900 text-base font-semibold border border-gray-200 transition-colors gap-2">
                <span className="material-symbols-outlined text-gray-600">play_circle</span>
                Watch Demo
              </button>
            </div>
          </div>

          <div className="flex-1 relative w-full max-w-2xl">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full"></div>
            <div className="relative rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-xl p-2 shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img alt="AI Dashboard Interface Preview" className="rounded-xl w-full h-auto object-cover border border-gray-200" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcmgEaUh2tfOd93k9f8JnFlW7QASdHMl28lbxGW_34F3I8eJRXqfs8EcCCsMTTdNT57eCmhqVa4m_6YFx-OBgjhfDFJxuovQ9JRuoZkPmskpdXQ21NW8PS0V3ylnI_Q6OubBfwHrKAQAcxcMl0-aRAYVKb3hmHXbx9glXD4PcWXHfN3tmsVbC6_tT2J_3ey1ReD5N_WMPpMsgNOFz0wq5OBIQe1TR2BW9w3OrnvbUIectcmRPALOLaWXwRAQUIgrrwbvX5p4-2UkU" />

              <div className="absolute -right-6 top-1/4 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl p-4 shadow-xl animate-bounce" style={{ animationDuration: "3s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-600">trending_up</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Match Score</p>
                    <p className="text-sm font-bold text-gray-900">98% Fit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-12">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
            <h2 className="text-3xl md:text-4xl font-black leading-tight text-gray-900">Supercharge Your Career Journey</h2>
            <p className="text-gray-600 text-lg">Markhub equips you with cutting-edge AI tools to navigate your career path with precision, logic, and unfair advantage.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-8 hover:bg-gray-50 hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-8xl text-primary">explore</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30 relative z-10">
                <span className="material-symbols-outlined">explore</span>
              </div>
              <div className="relative z-10 mt-4">
                <h3 className="text-xl font-bold mb-2 text-gray-900">AI Discovery</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Discover tailored career opportunities aligned with your unique skill matrix and ambitious aspirations.</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-8 hover:bg-gray-50 hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-8xl text-primary">analytics</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30 relative z-10">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <div className="relative z-10 mt-4">
                <h3 className="text-xl font-bold mb-2 text-gray-900">Skill Gap Analysis</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Identify structural weaknesses and bridge skill gaps with highly personalized, AI-curated learning paths.</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-8 hover:bg-gray-50 hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-8xl text-primary">work</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30 relative z-10">
                <span className="material-symbols-outlined">work</span>
              </div>
              <div className="relative z-10 mt-4">
                <h3 className="text-xl font-bold mb-2 text-gray-900">Auto-Portfolios</h3>
                <p className="text-gray-600 text-sm leading-relaxed">Automatically compile, format, and host a dynamic, undeniable portfolio of your technical achievements.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">hub</span>
            <span className="font-bold text-gray-900">Markhub AI</span>
            <span>© 2024. All systems operational.</span>
          </div>
          <div className="flex gap-8">
            <Link className="hover:text-primary transition-colors" href="#">Privacy</Link>
            <Link className="hover:text-primary transition-colors" href="#">Terms</Link>
            <Link className="hover:text-primary transition-colors" href="#">Documentation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
