"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/context/theme-context";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // Theme preference
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";
  const [mfa, setMfa] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleLogoutAll = () => {
    logout();
    router.push("/login");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setTimeout(() => {
      setSavingProfile(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
  };

  if (!user) {
    return null;
  }

  // Session details
  const activeSessions = [
    { device: "Chrome on macOS", location: "San Francisco, USA", status: "Active Now", current: true },
    { device: "Safari on iPhone 15", location: "London, UK", status: "2 hours ago", current: false },
    { device: "Firefox on Windows 11", location: "Berlin, Germany", status: "1 day ago", current: false },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-body">
      {/* Header section */}
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">
          Device Settings
        </h2>
        <p className="text-secondary text-sm sm:text-base">
          Manage your account profile, visual settings, and secure connections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Details Block */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center md:col-span-1 justify-between gap-4">
          <div className="space-y-4 w-full">
            <h3 className="font-display font-semibold text-xs text-secondary uppercase tracking-wider">
              Profile
            </h3>
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover border border-outline-variant/30 shadow-md mx-auto"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-3xl shadow-inner mx-auto uppercase">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="truncate">
              <p className="font-body text-base font-semibold text-on-surface truncate">{user.name}</p>
              <p className="text-xs text-secondary mt-0.5">Enterprise Plan</p>
            </div>
            <div className="bg-surface p-3 rounded-xl border border-outline-variant/10 text-[11px] text-secondary text-left space-y-1">
              <p>
                <strong className="text-on-surface">Member Since:</strong>{" "}
                {new Date(user.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="truncate">
                <strong className="text-on-surface">Email:</strong> {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogoutAll}
            className="w-full bg-error-container/10 text-error hover:bg-error-container/20 font-semibold py-2.5 rounded-xl transition-all text-xs active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>

        {/* Account Details Form & Preferences */}
        <div className="md:col-span-2 space-y-6">
          {/* Settings details form */}
          <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h3 className="font-display font-semibold text-base sm:text-lg text-on-surface mb-4">
              Account Details
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary text-xs sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-surface-container-low rounded-xl border border-outline-variant/10 text-secondary focus:outline-none text-xs sm:text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {saveSuccess && (
                <div className="text-xs text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200/50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={savingProfile}
                className="bg-primary hover:bg-primary-container text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-75 text-xs flex items-center gap-1.5 ml-auto"
              >
                {savingProfile ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </form>
          </div>

          {/* Preferences Toggles */}
          <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h3 className="font-display font-semibold text-base sm:text-lg text-on-surface mb-4">
              Preferences & Security
            </h3>

            <div className="space-y-4">
              {/* Dark Mode Toggle */}
              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-on-surface">Dark Mode</p>
                  <p className="text-[11px] text-secondary mt-0.5">Toggle interface contrast to dark background themes.</p>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    darkMode ? "bg-primary" : "bg-outline-variant"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      darkMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* MFA Toggle */}
              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-on-surface">Two-Factor Authentication</p>
                  <p className="text-[11px] text-secondary mt-0.5">Secure your administrator login sessions with Google Authenticator.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMfa(!mfa)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    mfa ? "bg-primary" : "bg-outline-variant"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      mfa ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Active Sessions list */}
          <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h3 className="font-display font-semibold text-base sm:text-lg text-on-surface mb-4">
              Active Sessions
            </h3>
            <div className="divide-y divide-outline-variant/20">
              {activeSessions.map((session, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center text-xs sm:text-sm first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-[22px]">
                      {session.current ? "laptop_mac" : "devices"}
                    </span>
                    <div>
                      <p className="font-semibold text-on-surface">{session.device}</p>
                      <p className="text-[11px] text-secondary">{session.location}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    session.current ? "bg-emerald-500/10 text-emerald-600" : "bg-surface-container-high text-secondary"
                  }`}>
                    {session.status}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleLogoutAll}
              className="mt-5 text-xs text-error hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Log Out of All Devices</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
