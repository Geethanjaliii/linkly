import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-surface relative flex flex-col justify-between overflow-hidden">
      {/* Decorative Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none" 
        style={{ 
          backgroundImage: "radial-gradient(circle at 2px 2px, black 1px, transparent 0)", 
          backgroundSize: "24px 24px" 
        }}
      ></div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-container-max mx-auto px-6 h-20 flex justify-between items-center border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[32px] font-bold">shield_lock</span>
          <span className="font-display text-xl font-bold text-on-background">Linkly</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-secondary hover:text-primary transition-colors">
            Log In
          </Link>
          <Link 
            href="/signup" 
            className="bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-container transition-all active:scale-[0.97]"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 py-20 text-center flex-1 flex flex-col justify-center items-center">
        {/* Banner badge */}
        <div className="mb-6 bg-primary-fixed text-on-primary-fixed-variant text-xs font-semibold px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-primary/10">
          <span className="material-symbols-outlined text-[14px]">bolt</span>
          <span>Version 1.0 (MVP) Release</span>
        </div>

        <h1 className="font-display text-5xl md:text-6xl font-bold text-on-background tracking-tight leading-none mb-6">
          Shorten URLs.<br />
          <span className="gradient-text">Secure Every Click.</span>
        </h1>

        <p className="font-body text-secondary text-lg md:text-xl max-w-lg mb-10 leading-relaxed">
          Stops phishing and malware propagation at the link level. Shorten links, configure slugs, and verify security in one unified interface.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link 
            href="/signup" 
            className="bg-primary text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
          >
            <span>Create Free Account</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          <Link 
            href="/login" 
            className="bg-white dark:bg-slate-800 border border-outline-variant dark:border-slate-700 text-on-surface dark:text-white hover:bg-surface-container-low dark:hover:bg-slate-700 font-semibold px-8 py-3.5 rounded-xl transition-all active:scale-[0.98]"
          >
            Access Dashboard
          </Link>
        </div>

        {/* Feature quick view */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-xl text-left">
          <div className="p-4 rounded-xl border border-outline-variant/20 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <span className="material-symbols-outlined text-primary mb-2">add_link</span>
            <h3 className="font-semibold text-sm mb-1 text-on-surface">Secure Shortening</h3>
            <p className="text-xs text-secondary">Instantly shorten any long target URL with custom alias slugs.</p>
          </div>
          <div className="p-4 rounded-xl border border-outline-variant/20 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <span className="material-symbols-outlined text-primary mb-2">verified_user</span>
            <h3 className="font-semibold text-sm mb-1 text-on-surface">Malware Scan</h3>
            <p className="text-xs text-secondary">Rule-based scanner detects phishing triggers in real-time.</p>
          </div>
          <div className="p-4 rounded-xl border border-outline-variant/20 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <span className="material-symbols-outlined text-primary mb-2">analytics</span>
            <h3 className="font-semibold text-sm mb-1 text-on-surface">Link Analytics</h3>
            <p className="text-xs text-secondary">Keep track of total click counts and last-accessed metrics.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 text-center border-t border-outline-variant/10 dark:border-slate-800/20 text-xs text-secondary">
        <p>© 2026 Linkly SaaS. Built with Next.js & FastAPI.</p>
      </footer>
    </main>
  );
}
