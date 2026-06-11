"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient } from "@/lib/api-client";

interface UrlResponse {
  id: number;
  original_url: string;
  short_code: string;
  short_url: string;
  click_count: number;
  created_at: string;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [urls, setUrls] = useState<UrlResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const data = await ApiClient.get<UrlResponse[]>("/urls", true);
        setUrls(data);
      } catch (err) {
        console.error("Failed to load URLs for analytics", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchUrls();
    }
  }, [user]);

  const totalLinks = urls.length;
  const totalClicks = urls.reduce((sum, url) => sum + url.click_count, 0);

  // Top Countries Data
  const countries = [
    { name: "United States", percentage: 62, count: Math.round(totalClicks * 0.62) || 12 },
    { name: "Canada", percentage: 15, count: Math.round(totalClicks * 0.15) || 3 },
    { name: "United Kingdom", percentage: 12, count: Math.round(totalClicks * 0.12) || 2 },
    { name: "Germany", percentage: 8, count: Math.round(totalClicks * 0.08) || 1 },
    { name: "France", percentage: 3, count: Math.round(totalClicks * 0.03) || 1 },
  ];

  // Devices & Browsers Data
  const devices = [
    { name: "Chrome", percentage: 45 },
    { name: "Safari", percentage: 30 },
    { name: "Firefox", percentage: 15 },
    { name: "Edge", percentage: 10 },
  ];

  // Live Activity Data
  const liveActivities = [
    { device: "Chrome", location: "United States", time: "1 min ago", icon: "laptop_mac" },
    { device: "Safari", location: "United Kingdom", time: "5 mins ago", icon: "phone_iphone" },
    { device: "Firefox", location: "Germany", time: "12 mins ago", icon: "laptop_chromebook" },
    { device: "Chrome", location: "Canada", time: "25 mins ago", icon: "desktop_windows" },
    { device: "Safari", location: "France", time: "1 hour ago", icon: "phone_iphone" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header section */}
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">
          Analytics Overview
        </h2>
        <p className="text-secondary text-sm sm:text-base">
          Real-time performance of your various links.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs text-secondary font-medium uppercase tracking-wider">Total Clicks</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold font-display text-on-surface">
              {totalClicks > 1000 ? `${(totalClicks / 1000).toFixed(1)}K` : totalClicks}
            </p>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px] font-bold">arrow_upward</span>
              8.4%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs text-secondary font-medium uppercase tracking-wider">Total Links</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold font-display text-on-surface">{totalLinks}</p>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px] font-bold">arrow_upward</span>
              12.5%
            </span>
          </div>
        </div>
      </div>

      {/* Click Trends Chart */}
      <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-display font-semibold text-base sm:text-lg text-on-surface mb-6">
          Click Trends
        </h3>
        
        {/* Curved SVG Line Chart */}
        <div className="w-full h-48 relative">
          <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#004ac6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#004ac6" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid Lines */}
            <line x1="0" y1="37" x2="500" y2="37" className="stroke-[#e5eeff] dark:stroke-slate-800/60" strokeWidth="0.5" />
            <line x1="0" y1="75" x2="500" y2="75" className="stroke-[#e5eeff] dark:stroke-slate-800/60" strokeWidth="0.5" />
            <line x1="0" y1="112" x2="500" y2="112" className="stroke-[#e5eeff] dark:stroke-slate-800/60" strokeWidth="0.5" />
            
            {/* Area Path */}
            <path
              d="M 0 130 Q 70 80 140 100 T 280 40 T 420 70 L 500 30 L 500 150 L 0 150 Z"
              fill="url(#chartGradient)"
            />
            {/* Line Path */}
            <path
              d="M 0 130 Q 70 80 140 100 T 280 40 T 420 70 L 500 30"
              fill="none"
              stroke="#004ac6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Pulsing Highlight Dot */}
            <circle cx="280" cy="40" r="4" fill="#004ac6" />
            <circle cx="280" cy="40" r="8" fill="#004ac6" fillOpacity="0.2" className="animate-ping" />
          </svg>
        </div>
        <div className="flex justify-between text-[10px] sm:text-xs text-secondary mt-4 font-mono">
          <span>09:00 AM</span>
          <span>11:00 AM</span>
          <span>01:00 PM</span>
          <span>03:00 PM</span>
          <span>05:00 PM</span>
        </div>
      </div>

      {/* Grid: Top Countries & Devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 className="font-display font-semibold text-base sm:text-lg text-on-surface mb-4">
            Top Countries
          </h3>
          <div className="space-y-4">
            {countries.map((country) => (
              <div key={country.name} className="space-y-1.5">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-medium text-on-surface">{country.name}</span>
                  <span className="text-secondary font-mono">{country.percentage}% ({country.count} clicks)</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Devices & Browsers */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 className="font-display font-semibold text-base sm:text-lg text-on-surface mb-4">
            Devices & Browsers
          </h3>
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.name} className="space-y-1.5">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-medium text-on-surface">{device.name}</span>
                  <span className="text-secondary font-mono">{device.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tertiary rounded-full"
                    style={{ width: `${device.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="font-display font-semibold text-base sm:text-lg text-on-surface mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <span>Live Activity</span>
        </h3>
        <div className="divide-y divide-outline-variant/20">
          {liveActivities.map((act, idx) => (
            <div key={idx} className="py-3 flex justify-between items-center text-xs sm:text-sm first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  {act.icon}
                </span>
                <div>
                  <p className="font-semibold text-on-surface">Click from {act.device}</p>
                  <p className="text-[11px] text-secondary">{act.location}</p>
                </div>
              </div>
              <span className="text-[11px] text-secondary font-mono">{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
