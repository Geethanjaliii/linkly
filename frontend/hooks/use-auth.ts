"use client";

import { useState, useEffect, useCallback } from "react";
import { ApiClient } from "@/lib/api-client";

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  profile_picture?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    const token = ApiClient.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const currentUser = await ApiClient.get<User>("/me", true);
      setUser(currentUser);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch user session", err);
      ApiClient.removeToken();
      setUser(null);
      setError(err.message || "Session expired");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        let errorMessage = "Invalid credentials";
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      ApiClient.setToken(data.access_token);
      await fetchCurrentUser();
      return true;
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
      setLoading(false);
      throw err;
    }
  };


  const signup = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await ApiClient.post<User>(
        "/signup",
        { name, email, password },
        false
      );
      await login(email, password);
      return true;
    } catch (err: any) {
      setError(err.message || "Registration failed");
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    ApiClient.removeToken();
    setUser(null);
    setError(null);
  };

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    refreshUser: fetchCurrentUser,
  };
}
