"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import Tasks from "@/components/Tasks";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

type User = { id: string; email: string; display_name: string | null };
type Member = { role: "owner" | "member"; user: User };
type Project = {
  id: string;
  name: string;
  description: string;
  due_date: string | null;
  members: Member[];
  progress: { todo: number; in_progress: number; done: number };
  my_role: "owner" | "member";
};

const who = (u?: User) => (u ? u.display_name || u.email : "nobody");

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [me, setMe] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api<Project>(`/projects/${id}`).then(setProject).catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? ""));
  }, [load]);

  async function run(fn: () => Promise<unknown>) {
    setError("");
    try {
      await fn();
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  function addMember(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      await api(`/projects/${id}/members`, { method: "POST", body: JSON.stringify({ email }) });
      setEmail("");
    });
  }

  async function removeMember(userId: string) {
    await run(() => api(`/projects/${id}/members/${userId}`, { method: "DELETE" }));
    if (userId === me) router.push("/dashboard");
  }

  if (!project) {
    return (
      <>
        <Header />
        <p className="p-6 text-gray-500">{error || "loading..."}</p>
      </>
    );
  }

  const owner = project.my_role === "owner";
  const { todo, in_progress, done } = project.progress;
  const total = todo + in_progress + done;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        {project.description && <p className="text-gray-600">{project.description}</p>}
        <p className="text-sm text-gray-500">{project.due_date ? `due ${project.due_date}` : "no due date"}</p>
        {error && <p className="mt-2 text-red-600">{error}</p>}

        <section className="mt-6">
          <p className="mb-1 text-sm text-gray-600">
            {done}/{total} tasks done, {in_progress} in progress
          </p>
          <div className="h-2 rounded bg-gray-200">
            <div className="h-2 rounded bg-uf-orange" style={{ width: total ? `${(done / total) * 100}%` : 0 }} />
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-2 text-lg font-semibold">Members</h2>
          <ul className="divide-y rounded border">
            {project.members.map((m) => (
              <li key={m.user.id} className="flex items-center justify-between p-2">
                <span>
                  {who(m.user)} {m.role === "owner" && <span className="text-xs text-uf-blue">owner</span>}
                </span>
                {m.role !== "owner" && (owner || m.user.id === me) && (
                  <button onClick={() => removeMember(m.user.id)} className="text-sm text-red-600 hover:underline">
                    {m.user.id === me ? "leave" : "remove"}
                  </button>
                )}
              </li>
            ))}
          </ul>

          {owner && (
            <form onSubmit={addMember} className="mt-2 flex gap-2">
              <input
                className="flex-1 rounded border p-2"
                type="email"
                placeholder="teammate's email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button className="rounded bg-uf-blue px-4 text-white">Add</button>
            </form>
          )}
        </section>

        <Tasks
          projectId={id}
          people={project.members.map((m) => ({ id: m.user.id, name: who(m.user) }))}
          me={me}
          owner={owner}
          onChange={load}
        />
      </main>
    </>
  );
}
