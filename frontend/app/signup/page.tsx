"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { generateCodeVerifier, generateCodeChallenge } from "@/lib/pkce";
import { FcGoogle } from "react-icons/fc";

export default function SignupPage() {
  const router = useRouter();
  const { user, signup, loading: authLoading, error: authError } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
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

    if (!name || !email || !password || !confirmPassword) {
      setLocalError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setLocalError("You must agree to the Terms of Service & Privacy Policy.");
      return;
    }

    try {
      setIsSubmitting(true);
      await signup(name, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setLocalError(err.message || "Registration failed. Please try again.");
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
    <main className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-surface">
      {/* Left Branding Column (Desktop Only) */}
      <section className="hidden lg:flex lg:w-1/2 relative bg-primary-container items-center justify-center p-12 overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#ffffff_0%,transparent_50%)]"></div>
        </div>
        
        <div className="relative z-10 max-w-md text-center flex flex-col items-center">
          <div className="mb-6 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
            <span className="material-symbols-outlined text-[64px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield_lock
            </span>
          </div>
          
          <h2 className="font-display text-4xl font-bold text-white mb-2">Linkly</h2>
          <p className="font-body text-white/85 text-lg mb-8">
            Shorten URLs. Secure Every Click.
          </p>

          <div className="w-full bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl text-left text-white space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/60">Features</h4>
            <div className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-white/80">check_circle</span>
              <p className="text-sm">Instant secure link shortening and aliasing</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-white/80">check_circle</span>
              <p className="text-sm">Rule-based threat scanning for suspicious link activity</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-white/80">check_circle</span>
              <p className="text-sm">Visual metrics overview of total clicks and access logs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Register Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface overflow-y-auto">
        <div className="w-full max-w-[460px] bg-white dark:bg-slate-900 border border-outline-variant/30 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
          <div className="mb-6 text-center lg:text-left">
            {/* Small Branding Header for Mobile */}
            <div className="flex justify-center lg:justify-start items-center gap-2 mb-3 lg:hidden">
              <span className="material-symbols-outlined text-primary text-[28px] font-bold">shield_lock</span>
              <h1 className="font-display text-xl font-bold text-primary">Linkly</h1>
            </div>
            <h3 className="font-display text-2xl font-bold text-on-background mb-2">Create your account</h3>
            <p className="font-body text-secondary text-sm">
              Enter your details to register your free 14-day trial key.
            </p>
          </div>

          {(localError || authError) && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl text-sm border border-error/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-[20px]">error</span>
              <span>{localError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[20px]">
                  person
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  placeholder="Alex Chen"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
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
                  className="w-full bg-surface border border-outline-variant/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  placeholder="alex@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[20px]">
                  lock
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-secondary text-[20px]">
                  lock
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Checkbox agreement */}
            <div className="flex items-start gap-2.5 py-1">
              <input
                id="agree-checkbox"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-outline-variant/50 text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer"
              />
              <label htmlFor="agree-checkbox" className="text-xs text-on-surface-variant leading-tight cursor-pointer">
                I agree to the{" "}
                <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-container transition-all active:scale-[0.98] duration-150 flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none mt-2 shadow-md shadow-primary/10"
            >
              <span>{isSubmitting ? "Creating Account..." : "Create Account"}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-outline-variant/30 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-4 text-secondary font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google OAuth Signup */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white dark:bg-slate-800 border border-outline-variant dark:border-slate-700 text-on-surface dark:text-white hover:bg-surface-container-low dark:hover:bg-slate-700 font-semibold py-3 rounded-xl transition-all active:scale-[0.98] duration-150 flex items-center justify-center gap-2"
          >
            <FcGoogle size={22} />
            <span>Google</span>
          </button>

          <p className="mt-6 text-center text-sm text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
