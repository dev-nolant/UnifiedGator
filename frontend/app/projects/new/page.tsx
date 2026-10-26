"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "@/components/Header";
import { api } from "@/lib/api";

export default function NewProject() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const project = await api<{ id: string }>("/projects", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), description: description.trim(), due_date: dueDate || null }),
      });
      router.push(`/projects/${project.id}`);
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-xl p-6">
        <h1 className="mb-4 text-2xl font-semibold">New project</h1>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            className="rounded border p-2"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
            required
          />
          <textarea
            className="rounded border p-2"
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label className="text-sm text-gray-600">
            Due date
            <input
              className="ml-2 rounded border p-2"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button disabled={saving} className="rounded bg-uf-blue p-2 text-white disabled:opacity-50">
            {saving ? "..." : "Create"}
          </button>
        </form>
      </main>
    </>
  );
}
