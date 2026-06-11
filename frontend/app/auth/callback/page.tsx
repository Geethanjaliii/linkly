"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const stateError = searchParams.get("error");

    if (stateError) {
      setError(`Google Auth Error: ${stateError}`);
      return;
    }

    if (!code) {
      setError("Authorization code is missing from Google redirect.");
      return;
    }

    const exchangeCode = async () => {
      try {
        const codeVerifier = sessionStorage.getItem("google_code_verifier") || "";
        if (!codeVerifier) {
          throw new Error("PKCE code verifier is missing from session state. Ensure your browser tab session is active.");
        }
        
        // Remove code_verifier immediately to avoid reuse
        sessionStorage.removeItem("google_code_verifier");

        const redirectUri = `${window.location.origin}/auth/callback`;
        const response = await ApiClient.post<{ access_token: string }>("/auth/google", {
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }, false);

        // Save JWT token
        ApiClient.setToken(response.access_token);
        
        // Refresh auth context user state
        await refreshUser();
        
        // Redirect to dashboard
        router.push("/dashboard");
      } catch (err: any) {
        console.error("Google auth callback failed", err);
        setError(err.message || "Failed to authenticate with Google.");
      }
    };

    exchangeCode();
  }, [searchParams, router, refreshUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="w-full max-w-md bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm text-center space-y-4">
          <span className="material-symbols-outlined text-error text-[48px]">error</span>
          <h2 className="font-display text-xl font-bold text-on-background">Authentication Failed</h2>
          <p className="text-secondary text-sm leading-relaxed">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-primary text-white font-semibold py-2.5 rounded-xl hover:bg-primary-container transition-all active:scale-[0.98]"
          >
            Back to Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <span className="material-symbols-outlined text-primary text-[48px] animate-spin">
          sync
        </span>
        <p className="font-body text-secondary text-sm">Authenticating with Google...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[48px] animate-spin">
              sync
            </span>
            <p className="font-body text-secondary text-sm">Loading callback...</p>
          </div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
