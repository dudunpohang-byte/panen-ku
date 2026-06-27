/**
 * API Configuration untuk Panenku App
 * 
 * Development: localhost
 * Production: tunnel/public URL
 */

// Untuk akses publik, gunakan tunnel URL
// Untuk development lokal, gunakan localhost
const DEV_API = "http://localhost:4000";
const PROD_API = "https://afraid-badger-74.loca.lt";

function getBaseUrl(): string {
  // Di browser, cek hostname
  if (typeof window !== "undefined") {
    // Jika diakses lewat tunnel atau domain publik
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return PROD_API;
    }
  }
  return DEV_API;
}

export const API_BASE_URL = getBaseUrl();

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// Helper untuk fetch dengan auth
export async function apiGetWithAuth<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}