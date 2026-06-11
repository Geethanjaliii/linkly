"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { generateCodeVerifier, generateCodeChallenge } from "@/lib/pkce";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading: authLoading, error: authError } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user && !authLoading) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    
    if (!email || !password) {
      setLocalError("Please fill in all fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setLocalError(err.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      alert("Google Client ID is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your .env.local file.");
      return;
    }
    
    try {
      setLocalError("");
      const verifier = generateCodeVerifier();
      sessionStorage.setItem("google_code_verifier", verifier);
      
      const challenge = await generateCodeChallenge(verifier);
      const redirectUri = `${window.location.origin}/auth/callback`;
      const scope = "openid email profile";
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `code_challenge=${challenge}&` +
        `code_challenge_method=S256`;
        
      window.location.href = authUrl;
    } catch (err) {
      console.error("PKCE challenge generation failed", err);
      setLocalError("Failed to initiate Google sign-in.");
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* Branding Section (Left/Top) */}
      <section className="relative w-full md:w-1/2 lg:w-2/5 min-h-[35vh] md:min-h-screen bg-primary flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Background Decorative Pattern */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none" 
          style={{ 
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", 
            backgroundSize: "32px 32px" 
          }}
        ></div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          {/* Brand Identity */}
          <div className="mb-6 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
            <span className="material-symbols-outlined text-[64px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield_lock
            </span>
          </div>
          
          <h2 className="font-display text-4xl font-bold text-white mb-2">Linkly</h2>
          <p className="font-body text-white/80 text-lg">
            Shorten URLs. Secure Every Click.
          </p>

          {/* Micro stats banner in branding */}
          <div className="mt-8 glass-panel px-6 py-4 rounded-xl text-white/90 text-sm flex gap-6 divide-x divide-white/20 border border-white/10">
            <div>
              <span className="block font-bold text-lg">1M+</span>
              <span className="text-xs text-white/60">Links Created</span>
            </div>
            <div className="pl-6">
              <span className="block font-bold text-lg">99.9%</span>
              <span className="text-xs text-white/60">Safe Redirection</span>
            </div>
          </div>
        </div>
      </section>

      {/* Login Form Section (Right/Bottom) */}
      <section className="w-full md:w-1/2 lg:w-3/5 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
          <div className="mb-8 text-center md:text-left">
            <h3 className="font-display text-2xl font-bold text-on-background mb-2">Welcome Back</h3>
            <p className="font-body text-secondary text-sm">
              Log in to manage your secure link infrastructure.
            </p>
          </div>

          {(localError || authError) && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm border border-error/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[20px]">error</span>
              <span>{localError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[20px]">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/50 rounded-xl py-3 pl-10 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none"
                  placeholder="alex.chen@enterprise.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold uppercase tracking-wider text-secondary">
                  Password
                </label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[20px]">
                  lock
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/50 rounded-xl py-3 pl-10 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-container transition-all active:scale-[0.98] duration-150 flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none mt-2 shadow-md shadow-primary/10"
            >
              <span>{isSubmitting ? "Logging in..." : "Login"}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-outline-variant/30 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-4 text-secondary font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google OAuth Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white dark:bg-slate-800 border border-outline-variant dark:border-slate-700 text-on-surface dark:text-white hover:bg-surface-container-low dark:hover:bg-slate-700 font-semibold py-3 rounded-xl transition-all active:scale-[0.98] duration-150 flex items-center justify-center gap-2"
          >
            <FcGoogle size={22} />
            <span>Google</span>
          </button>

          <p className="mt-8 text-center text-sm text-secondary">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
