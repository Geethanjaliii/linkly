"use client";

import { useState } from "react";

export default function SecurityPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedCount, setAnalyzedCount] = useState<number | null>(null);
  
  // Toggles states
  const [realtimeScan, setRealtimeScan] = useState(true);
  const [autoBlock, setAutoBlock] = useState(true);
  const [notifications, setNotifications] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzedCount(Math.floor(Math.random() * 50) + 10);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">
            Malware Scan
          </h2>
          <p className="text-secondary text-sm sm:text-base">
            Configure scan settings, parameters, and security actions.
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="bg-primary hover:bg-primary-container text-white font-semibold px-5 py-3 rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 text-sm shrink-0 self-start sm:self-auto shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px] animate-none">
            {analyzing ? "sync" : "security"}
          </span>
          <span>{analyzing ? "Analyzing..." : "Analyze Links"}</span>
        </button>
      </div>

      {analyzedCount !== null && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[24px]">verified</span>
          <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
            Scan completed! Analyzed {analyzedCount} active links. 0 threats detected.
          </p>
        </div>
      )}

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center justify-center md:col-span-1">
          <h3 className="font-display font-semibold text-sm text-secondary uppercase tracking-wider mb-4">
            Security Status
          </h3>
          
          {/* Circular SVG Progress */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="52"
                className="stroke-[#e5eeff] dark:stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="52"
                stroke="#ba1a1a" // Error path
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={326}
                strokeDashoffset={326 * 0.06} // 94% score
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ stroke: "#10b981" }} // Override to Emerald Green
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-display text-on-surface">94</span>
              <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider">/100</span>
            </div>
          </div>

          <p className="text-sm font-semibold text-on-surface mt-4">Excellent Rating</p>
          <p className="text-xs text-secondary mt-1">Infrastructure is secure.</p>
        </div>

        {/* Threats Stats Card */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-6 shadow-sm md:col-span-2 space-y-6">
          <h3 className="font-display font-semibold text-base text-on-surface">
            Threats Overview
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface p-4 rounded-xl border border-outline-variant/20">
              <p className="text-xs text-secondary font-medium">Threats Blocked</p>
              <p className="text-2xl font-bold font-display text-error mt-1">12</p>
              <p className="text-[10px] text-secondary mt-1">Total malicious URL hits</p>
            </div>
            
            <div className="bg-surface p-4 rounded-xl border border-outline-variant/20">
              <p className="text-xs text-secondary font-medium">Sites Flagged</p>
              <p className="text-2xl font-bold font-display text-amber-600 mt-1">3</p>
              <p className="text-[10px] text-secondary mt-1">Across linked domains</p>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 text-xs text-secondary leading-relaxed">
            <strong className="text-on-surface font-semibold block mb-1">Threat Engine Active</strong>
            Linkly continuously checks your destinations against commercial and public reputation blocklists every hour.
          </div>
        </div>
      </div>

      {/* Flag Details and Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Why was this URL flagged? */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 className="font-display font-semibold text-base sm:text-lg text-on-surface mb-4">
            Why was this URL flagged?
          </h3>
          <div className="space-y-4">
            <div className="flex gap-3 text-xs sm:text-sm">
              <span className="material-symbols-outlined text-error shrink-0">gpp_maybe</span>
              <div>
                <strong className="text-on-surface font-semibold">Google Safe Browsing</strong>
                <p className="text-secondary mt-0.5">Identified target page running phishing scripts.</p>
              </div>
            </div>

            <div className="flex gap-3 text-xs sm:text-sm">
              <span className="material-symbols-outlined text-error shrink-0">gpp_maybe</span>
              <div>
                <strong className="text-on-surface font-semibold">PhishTank</strong>
                <p className="text-secondary mt-0.5">Reported malicious duplicate login spoof patterns.</p>
              </div>
            </div>

            <div className="flex gap-3 text-xs sm:text-sm">
              <span className="material-symbols-outlined text-error shrink-0">gpp_maybe</span>
              <div>
                <strong className="text-on-surface font-semibold">Spamhaus</strong>
                <p className="text-secondary mt-0.5">Listed destination domain in high-frequency spam index.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Proactive Scanning Options */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 className="font-display font-semibold text-base sm:text-lg text-on-surface mb-4">
            Proactive Scanning
          </h3>
          
          <div className="space-y-5">
            {/* Toggle 1 */}
            <div className="flex justify-between items-center gap-4">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-on-surface">Real-time Link Scan</p>
                <p className="text-[11px] text-secondary mt-0.5">Scan redirect destinations dynamically upon user clicks.</p>
              </div>
              <button
                type="button"
                onClick={() => setRealtimeScan(!realtimeScan)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  realtimeScan ? "bg-primary" : "bg-outline-variant"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    realtimeScan ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex justify-between items-center gap-4">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-on-surface">Automated Block</p>
                <p className="text-[11px] text-secondary mt-0.5">Instantly stop client redirects if the target site is flagged.</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoBlock(!autoBlock)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoBlock ? "bg-primary" : "bg-outline-variant"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoBlock ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex justify-between items-center gap-4">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-on-surface">Threat Notifications</p>
                <p className="text-[11px] text-secondary mt-0.5">Email administrator if click attempts hit restricted destinations.</p>
              </div>
              <button
                type="button"
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notifications ? "bg-primary" : "bg-outline-variant"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
