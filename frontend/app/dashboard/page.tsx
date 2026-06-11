"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // URL management states
  const [urls, setUrls] = useState<UrlResponse[]>([]);
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Shorten URL states
  const [urlInput, setUrlInput] = useState("");
  const [isShortening, setIsShortening] = useState(false);
  const [shortenSuccess, setShortenSuccess] = useState<UrlResponse | null>(null);
  const [shortenError, setShortenError] = useState<string | null>(null);

  // Search filtering state
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Modal states
  const [editingUrl, setEditingUrl] = useState<UrlResponse | null>(null);
  const [editInputValue, setEditInputValue] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Modal states
  const [deletingUrl, setDeletingUrl] = useState<UrlResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // UI helpers
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch URL history list on mount
  useEffect(() => {
    if (user) {
      fetchUrls();
    }
  }, [user]);

  const fetchUrls = async () => {
    try {
      setLoadingUrls(true);
      setError(null);
      const data = await ApiClient.get<UrlResponse[]>("/urls", true);
      // Sort URLs by created date descending
      const sorted = data.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setUrls(sorted);
    } catch (err: any) {
      console.error("Failed to load URLs", err);
      setError(err.message || "Failed to load link history.");
    } finally {
      setLoadingUrls(false);
    }
  };

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    let urlToShorten = urlInput.trim();
    if (!urlToShorten) return;

    // Automatically prefix with https:// if no protocol is supplied
    if (!/^https?:\/\//i.test(urlToShorten)) {
      urlToShorten = `https://${urlToShorten}`;
    }

    try {
      setIsShortening(true);
      setShortenError(null);
      setShortenSuccess(null);

      const response = await ApiClient.post<UrlResponse>(
        "/shorten",
        { original_url: urlToShorten },
        true
      );

      // Prepend to URL list for real-time update
      setUrls((prev) => [response, ...prev]);
      setShortenSuccess(response);
      setUrlInput("");
    } catch (err: any) {
      console.error("Shorten failed", err);
      setShortenError(err.message || "Failed to shorten URL. Make sure it's a valid link.");
    } finally {
      setIsShortening(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUrl) return;
    let urlToSave = editInputValue.trim();
    if (!urlToSave) {
      setEditError("URL cannot be empty");
      return;
    }

    if (!/^https?:\/\//i.test(urlToSave)) {
      urlToSave = `https://${urlToSave}`;
    }

    try {
      setIsSavingEdit(true);
      setEditError(null);
      const response = await ApiClient.put<UrlResponse>(
        `/url/${editingUrl.id}`,
        { original_url: urlToSave },
        true
      );

      // Real-time local state update
      setUrls((prev) =>
        prev.map((item) => (item.id === editingUrl.id ? response : item))
      );
      setEditingUrl(null);
    } catch (err: any) {
      console.error("Update failed", err);
      setEditError(err.message || "Failed to update URL. Ensure it is valid.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUrl) return;

    try {
      setIsDeleting(true);
      await ApiClient.delete(`/url/${deletingUrl.id}`, true);

      // Real-time local state update
      setUrls((prev) => prev.filter((item) => item.id !== deletingUrl.id));
      setDeletingUrl(null);
    } catch (err: any) {
      console.error("Delete failed", err);
      alert(err.message || "Failed to delete URL.");
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = async (urlText: string, id: number) => {
    try {
      await navigator.clipboard.writeText(urlText);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Clipboard copy failed, using fallback", err);
      const el = document.createElement("textarea");
      el.value = urlText;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Metrics calculation
  const totalLinks = urls.length;
  const totalClicks = urls.reduce((sum, item) => sum + item.click_count, 0);
  const activeLinks = urls.filter((item) => item.click_count > 0).length;
  const securityScore = 100; // Static security score for MVP

  // Filtering list based on search query
  const filteredUrls = urls.filter((url) => {
    const query = searchQuery.toLowerCase();
    return (
      url.original_url.toLowerCase().includes(query) ||
      url.short_code.toLowerCase().includes(query) ||
      url.short_url.toLowerCase().includes(query)
    );
  });

  if (loading || !user) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header section */}
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">
          Console Dashboard
        </h2>
        <p className="text-secondary text-sm sm:text-base">
          Manage and track your secured shortened links in real-time.
        </p>
      </div>

      {/* 4 Statistics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Links Card */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]">link</span>
          </div>
          <div>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Total Links</p>
            <p className="text-2xl sm:text-3xl font-bold font-display text-on-surface mt-0.5">{totalLinks}</p>
          </div>
        </div>

        {/* Total Clicks Card */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]">ads_click</span>
          </div>
          <div>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Total Clicks</p>
            <p className="text-2xl sm:text-3xl font-bold font-display text-on-surface mt-0.5">{totalClicks}</p>
          </div>
        </div>

        {/* Active Links Card */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]">insights</span>
          </div>
          <div>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Active Links</p>
            <p className="text-2xl sm:text-3xl font-bold font-display text-on-surface mt-0.5">{activeLinks}</p>
          </div>
        </div>

        {/* Security Score Card */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]">verified_user</span>
          </div>
          <div>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">Security Score</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <p className="text-2xl sm:text-3xl font-bold font-display text-on-surface">{securityScore}</p>
              <span className="text-xs font-semibold text-emerald-600">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shorten Widget */}
      <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="font-display font-semibold text-base sm:text-lg text-on-surface mb-3">
          Shorten a new link
        </h3>
        <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
              link
            </span>
            <input
              type="text"
              placeholder="Paste a long URL here (e.g. google.com)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-surface rounded-xl border border-outline-variant/30 text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm sm:text-base"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isShortening}
            className="bg-primary hover:bg-primary-container text-white font-semibold px-6 py-3.5 rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm sm:text-base shrink-0"
          >
            {isShortening ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                <span>Shortening...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">bolt</span>
                <span>Shorten URL</span>
              </>
            )}
          </button>
        </form>

        {shortenError && (
          <div className="mt-3 text-xs sm:text-sm text-error bg-error-container/10 px-4 py-3 rounded-xl border border-error-container/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{shortenError}</span>
          </div>
        )}

        {shortenSuccess && (
          <div className="mt-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                URL Shortened Successfully!
              </p>
              <div className="flex items-center gap-2 mt-1 min-w-0">
                <a
                  href={shortenSuccess.short_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-display font-semibold text-primary hover:underline truncate text-sm sm:text-base"
                >
                  {shortenSuccess.short_url}
                </a>
                <span className="text-secondary text-xs truncate hidden sm:inline">
                  ({shortenSuccess.original_url})
                </span>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(shortenSuccess.short_url, -1)}
              className="bg-white dark:bg-slate-800 hover:bg-surface dark:hover:bg-slate-700 border border-outline-variant/30 dark:border-slate-700 text-secondary dark:text-slate-300 hover:text-on-surface dark:hover:text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 self-start sm:self-auto shrink-0 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copiedId === -1 ? "check" : "content_copy"}
              </span>
              <span>{copiedId === -1 ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Links Management Table wrapper */}
      <div className="bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-outline-variant/30 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-display font-semibold text-base sm:text-lg text-on-surface">
            Link History
          </h3>
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by URL or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface rounded-xl border border-outline-variant/30 text-xs sm:text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Responsive links table with horizontal scrolling */}
        <div className="overflow-x-auto w-full">
          {loadingUrls ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-primary text-[36px] animate-spin">
                sync
              </span>
              <p className="font-body text-secondary text-sm">Loading links...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-error max-w-md mx-auto space-y-2">
              <span className="material-symbols-outlined text-[36px]">error</span>
              <p className="text-sm font-semibold">{error}</p>
              <button
                onClick={fetchUrls}
                className="text-primary text-xs hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>Retry loading</span>
              </button>
            </div>
          ) : filteredUrls.length === 0 ? (
            <div className="px-6 py-12 text-center text-secondary">
              <span className="material-symbols-outlined text-[48px] opacity-40 mb-2">
                link_off
              </span>
              <p className="text-sm font-medium">No links found</p>
              <p className="text-xs mt-1">Shorten a URL above to see it in your history.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-surface border-b border-outline-variant/30 text-secondary font-semibold uppercase tracking-wider text-[10px] sm:text-xs">
                  <th className="px-5 py-4">Short URL</th>
                  <th className="px-5 py-4">Original URL</th>
                  <th className="px-5 py-4 text-center">Clicks</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-body">
                {filteredUrls.map((url) => (
                  <tr key={url.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-5 py-4 font-semibold text-primary">
                      <div className="flex items-center gap-2 min-w-[170px]">
                        <a
                          href={url.short_url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          {url.short_url.replace(/^https?:\/\//i, "")}
                        </a>
                        <button
                          onClick={() => copyToClipboard(url.short_url, url.id)}
                          className="p-1 rounded hover:bg-surface text-secondary hover:text-on-surface transition-all active:scale-90"
                          title="Copy short URL"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {copiedId === url.id ? "check" : "content_copy"}
                          </span>
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-secondary max-w-[200px] md:max-w-[320px] truncate">
                      <a
                        href={url.original_url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-on-surface hover:underline"
                        title={url.original_url}
                      >
                        {url.original_url}
                      </a>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface">
                        {url.click_count}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-secondary whitespace-nowrap">
                      {new Date(url.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {/* Desktop and Tablet direct Actions (visible on sm: and above) */}
                      <div className="hidden sm:flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingUrl(url);
                            setEditInputValue(url.original_url);
                            setEditError(null);
                          }}
                          className="p-1.5 rounded-lg border border-outline-variant/30 dark:border-slate-700 text-secondary hover:text-primary hover:border-primary/30 transition-all shadow-sm bg-white dark:bg-slate-800"
                          title="Edit destination URL"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => setDeletingUrl(url)}
                          className="p-1.5 rounded-lg border border-outline-variant/30 dark:border-slate-700 text-error hover:bg-error-container/10 hover:border-error/30 transition-all shadow-sm bg-white dark:bg-slate-800"
                          title="Delete link"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>

                      {/* Mobile Actions Dropdown (visible on screen widths < 640px) */}
                      <div className="sm:hidden relative inline-block text-left">
                        <button
                          onClick={() =>
                            setActiveDropdownId(activeDropdownId === url.id ? null : url.id)
                          }
                          className="p-1.5 rounded-lg border border-outline-variant/30 dark:border-slate-700 text-secondary hover:text-on-surface bg-white dark:bg-slate-800 shadow-sm transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>

                        {activeDropdownId === url.id && (
                          <>
                            {/* Transparent click-outside backdrop */}
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setActiveDropdownId(null)}
                            />
                            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 border border-outline-variant/30 dark:border-slate-700 rounded-xl shadow-lg z-50 py-1.5 font-semibold text-xs text-left animate-fade-in">
                              <button
                                onClick={() => {
                                  copyToClipboard(url.short_url, url.id);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-4 py-2 hover:bg-surface dark:hover:bg-slate-700 text-secondary hover:text-on-surface flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  content_copy
                                </span>
                                <span>Copy</span>
                              </button>
                              <button
                                onClick={() => {
                                  setEditingUrl(url);
                                  setEditInputValue(url.original_url);
                                  setEditError(null);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-4 py-2 hover:bg-surface dark:hover:bg-slate-700 text-secondary hover:text-primary flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingUrl(url);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-4 py-2 hover:bg-error-container/5 dark:hover:bg-error/10 text-error flex items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                <span>Delete</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Destination Modal */}
      {editingUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setEditingUrl(null)}
          />

          {/* Modal Card */}
          <div className="relative bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-xl z-50 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit</span>
                <span>Edit Destination URL</span>
              </h3>
              <button
                onClick={() => setEditingUrl(null)}
                className="text-secondary hover:text-on-surface p-1 rounded-full hover:bg-surface dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Short Code
                </label>
                <div className="px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant/30 text-secondary text-sm font-mono select-all">
                  {editingUrl.short_code}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Destination URL
                </label>
                <input
                  type="text"
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface rounded-xl border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary text-sm sm:text-base"
                  placeholder="https://example.com"
                  required
                />
              </div>

              {editError && (
                <div className="text-xs text-error bg-error-container/10 px-3.5 py-2 rounded-xl border border-error-container/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{editError}</span>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setEditingUrl(null)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/30 dark:border-slate-700 font-semibold text-secondary dark:text-slate-300 text-sm hover:bg-surface dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit}
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-70 flex items-center gap-2"
                >
                  {isSavingEdit ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeletingUrl(null)}
          />

          {/* Modal Card */}
          <div className="relative bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl z-50 animate-scale-in">
            <div className="flex items-center gap-3 text-error mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <h3 className="font-display font-bold text-lg text-on-surface">
                Delete this link?
              </h3>
            </div>

            <p className="text-sm text-secondary mb-5 leading-relaxed">
              This action cannot be undone. Any traffic trying to access the short URL{" "}
              <strong className="font-mono text-on-surface">{deletingUrl.short_code}</strong> will
              no longer be redirected.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingUrl(null)}
                className="px-4 py-2.5 rounded-xl border border-outline-variant/30 dark:border-slate-700 font-semibold text-secondary dark:text-slate-300 text-sm hover:bg-surface dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-error hover:bg-error/90 text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-70 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Link</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
