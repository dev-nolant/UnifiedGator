import { supabase } from "./supabase";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(API + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session?.access_token}`,
      ...init.headers,
    },
  });

  if (res.status === 401) {
    window.location.href = "/login";
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    // validation errors come back as a list, not a string
    const msg = typeof body?.detail === "string" ? body.detail : `something went wrong (${res.status})`;
    throw new Error(msg);
  }
  return res.status === 204 ? (null as T) : res.json();
}
