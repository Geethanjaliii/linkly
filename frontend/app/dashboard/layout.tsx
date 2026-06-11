"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Set initial collapsed state on mount and adjust on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[48px] animate-spin">
            sync
          </span>
          <p className="font-body text-secondary text-sm">Validating session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Nav Links helper to check active status
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { name: "Analytics", href: "/dashboard/analytics", icon: "analytics" },
    { name: "Malware Scan", href: "/dashboard/security", icon: "security" },
    { name: "Settings", href: "/dashboard/settings", icon: "settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {/* Top Header App Bar (Always Visible) */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-outline-variant/30 dark:border-slate-800 z-40 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Collapse sidebar button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl text-secondary hover:bg-surface hover:text-on-surface mr-1 transition-all"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="material-symbols-outlined text-[24px]">
              {isSidebarCollapsed ? "menu_open" : "menu"}
            </span>
          </button>
          
          <span className="material-symbols-outlined text-primary text-[28px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield_lock
          </span>
          <h1 className="font-display text-xl font-bold text-primary">Linkly</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* User badge in top-bar */}
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-on-surface leading-tight">{user.name}</span>
            <span className="text-[10px] text-secondary">Enterprise Plan</span>
          </div>
          {user.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-outline-variant/30 shadow-sm shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-sm shadow-inner uppercase shrink-0">
              {user.name.charAt(0)}
            </div>
          )}
        </div>
      </header>

      {/* Desktop/Tablet Sidebar (Hidden on mobile) */}
      <aside
        className={`hidden md:flex fixed left-0 top-16 bottom-0 bg-white dark:bg-slate-900 border-r border-outline-variant/30 dark:border-slate-800 flex-col justify-between p-4 z-30 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "w-20" : "w-[240px] lg:w-[260px]"
        }`}
      >
        <div className="space-y-6">
          {/* User Headshot Info Panel */}
          {isSidebarCollapsed ? (
            <div className="flex justify-center p-1 bg-surface rounded-xl border border-outline-variant/20">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-outline-variant/30 shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm uppercase shrink-0">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2 bg-surface rounded-xl border border-outline-variant/20 transition-all duration-350">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-outline-variant/30 shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm uppercase shrink-0">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="truncate">
                <p className="font-body text-sm font-semibold text-on-surface truncate">{user.name}</p>
                <p className="text-[11px] text-secondary">Enterprise Plan</p>
              </div>
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isSidebarCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isSidebarCollapsed ? "px-0 py-3 justify-center" : "px-3.5 py-3"
                  } ${
                    isActive
                      ? "bg-secondary-container text-on-secondary-container font-semibold"
                      : "text-secondary hover:bg-surface hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          title={isSidebarCollapsed ? "Logout" : undefined}
          className={`flex items-center gap-3.5 rounded-xl text-sm font-medium text-error hover:bg-error-container/10 transition-all duration-200 mt-auto ${
            isSidebarCollapsed ? "px-0 py-3 justify-center" : "px-3.5 py-3"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          {!isSidebarCollapsed && <span>Logout</span>}
        </button>
      </aside>

      {/* Main Content Layout Container */}
      <div
        className={`flex-1 pt-16 pb-20 md:pb-6 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "md:pl-20" : "md:pl-[240px] lg:pl-[260px]"
        }`}
      >
        <main className="p-4 sm:p-6 md:p-8 max-w-container-max mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Hidden on tablet/desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-outline-variant/30 dark:border-slate-800 flex justify-around items-center z-40 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? "text-primary bg-primary-container/20 font-semibold"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>
                {item.icon}
              </span>
              <span className="text-[10px] mt-0.5 tracking-wide">{item.name.split(" ")[0]}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-16 h-12 rounded-xl text-error active:scale-95 transition-all duration-150"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-[10px] mt-0.5 tracking-wide">Logout</span>
        </button>
      </nav>
    </div>
  );
}
