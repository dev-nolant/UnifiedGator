"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [signingUp, setSigningUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNote("");
    setBusy(true);

    const { data, error } = signingUp
      ? await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } })
      : await supabase.auth.signInWithPassword({ email, password });

    setBusy(false);
    if (error) return setError(error.message);
    if (!data.session) return setNote("check your email to confirm your account, then log in");
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto mt-24 max-w-sm px-4">
      <h1 className="mb-6 text-3xl font-bold text-green-700">Unified Gator</h1>

      <form onSubmit={submit} className="flex flex-col gap-3">
        {signingUp && (
          <input
            className="rounded border p-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          className="rounded border p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="rounded border p-2"
          type="password"
          placeholder="Password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {note && <p className="text-sm text-green-700">{note}</p>}

        <button disabled={busy} className="rounded bg-green-700 p-2 text-white disabled:opacity-50">
          {busy ? "..." : signingUp ? "Sign up" : "Log in"}
        </button>
      </form>

      <button onClick={() => setSigningUp(!signingUp)} className="mt-4 text-sm text-gray-600 underline">
        {signingUp ? "already have an account? log in" : "new here? make an account"}
      </button>
    </main>
  );
}
