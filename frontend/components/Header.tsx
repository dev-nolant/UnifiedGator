"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-between border-b-4 border-uf-orange px-6 py-3">
      <Link href="/dashboard" className="text-xl font-bold text-uf-blue">
        Unified Gator
      </Link>
      <button onClick={logout} className="text-sm text-gray-600 hover:underline">
        Log out
      </button>
    </header>
  );
}
