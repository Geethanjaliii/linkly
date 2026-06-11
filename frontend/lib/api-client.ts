const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RequestOptions extends RequestInit {
  body?: any;
}

export class ApiClient {
  private static getHeaders(authRequired: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authRequired && typeof window !== "undefined") {
      const token = localStorage.getItem("linkly_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  static async request<T>(path: string, options: RequestOptions = {}, authRequired: boolean = true): Promise<T> {
    const url = `${API_URL}${path}`;
    const headers = this.getHeaders(authRequired);

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    };

    if (options.body && typeof options.body === "object") {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = "An error occurred";
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // Fallback to text
        try {
          errorMessage = await response.text();
        } catch {}
      }
      throw new Error(errorMessage);
    }

    // Handle empty response (like 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  static get<T>(path: string, authRequired: boolean = true): Promise<T> {
    return this.request<T>(path, { method: "GET" }, authRequired);
  }

  static post<T>(path: string, body: any, authRequired: boolean = true): Promise<T> {
    return this.request<T>(path, { method: "POST", body }, authRequired);
  }

  static put<T>(path: string, body: any, authRequired: boolean = true): Promise<T> {
    return this.request<T>(path, { method: "PUT", body }, authRequired);
  }

  static delete<T>(path: string, authRequired: boolean = true): Promise<T> {
    return this.request<T>(path, { method: "DELETE" }, authRequired);
  }

  static setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("linkly_token", token);
    }
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("linkly_token");
    }
    return null;
  }

  static removeToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("linkly_token");
    }
  }
}
