"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { api } from "@/lib/api";

type Project = { id: string; name: string; description: string; due_date: string | null };

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Project[]>("/projects").then(setProjects).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Your projects</h1>
          <Link href="/projects/new" className="rounded bg-uf-blue px-4 py-2 text-white">
            New project
          </Link>
        </div>
        {error && <p className="text-red-600">{error}</p>}
        {!projects && !error && <p className="text-gray-500">loading...</p>}
        {projects?.length === 0 && <p className="text-gray-500">no projects yet</p>}

        <ul className="grid gap-3 sm:grid-cols-2">
          {projects?.map((p) => (
            <li key={p.id}>
              <Link href={`/projects/${p.id}`} className="block rounded border p-4 hover:border-uf-orange">
                <p className="font-medium">{p.name}</p>
                {p.description && <p className="text-sm text-gray-600">{p.description}</p>}
                <p className="mt-2 text-xs text-gray-500">{p.due_date ? `due ${p.due_date}` : "no due date"}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
