"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../../lib/api";

type Member = {
  role: string;
  user?: { id: string; email?: string; display_name?: string };
};
type Project = {
  id: string;
  name: string;
  description: string;
  due_date: string | null;
  my_role?: string;
  members?: Member[];
};
type Task = {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  status?: string;
  due_date?: string | null;
  deadline?: string | null;
};

function readableDate(value?: string | null) {
  if (!value) return "No due date";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProject = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const projectData = await api<Project>(`/projects/${encodeURIComponent(projectId)}`);
      setProject(projectData);
      try {
        const taskData = await api<Task[]>(`/tasks?project_id=${encodeURIComponent(projectId)}`);
        setTasks(Array.isArray(taskData) ? taskData : []);
      } catch {
        setTasks([]);
      }
    } catch (err) {
      setProject(null);
      setError(
        err instanceof Error && err.message.includes("404")
          ? "This project doesn't exist, or you don't have access to it."
          : err instanceof Error ? err.message : "Could not load this project.",
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  if (loading) {
    return <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-600"><div className="mx-auto max-w-5xl">Loading project...</div></main>;
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
        <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Project unavailable</h1>
          <p role="alert" className="mt-3 text-slate-600">{error || "This project could not be found."}</p>
          <Link href="/dashboard" className="mt-6 inline-block font-semibold text-blue-700 hover:underline">Return to projects</Link>
        </section>
      </main>
    );
  }

  const members = project.members ?? [];
  const owner = project.my_role === "owner";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard" className="text-sm font-medium text-blue-700 hover:underline">← All projects</Link>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">{owner ? "Project owner" : "Team member"}</span>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Project workspace</p>
          <h1 className="mt-2 break-words text-3xl font-bold sm:text-4xl">{project.name}</h1>
          <p className="mt-3 whitespace-pre-wrap text-slate-600">{project.description || "No project description yet."}</p>
          <div className="mt-6 flex flex-wrap gap-6 border-t border-slate-100 pt-5 text-sm">
            <div><p className="text-slate-500">Due date</p><p className="mt-1 font-semibold">{readableDate(project.due_date)}</p></div>
            <div><p className="text-slate-500">Team members</p><p className="mt-1 font-semibold">{members.length}</p></div>
            <div><p className="text-slate-500">Tasks loaded</p><p className="mt-1 font-semibold">{tasks.length}</p></div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Team</h2><span className="text-sm text-slate-500">{members.length} members</span></div>
            {members.length ? (
              <ul className="mt-4 divide-y divide-slate-100">
                {members.map((member, index) => (
                  <li key={member.user?.id ?? index} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{member.user?.display_name || member.user?.email || "Project member"}</p>
                      {member.user?.display_name && member.user?.email && <p className="truncate text-sm text-slate-500">{member.user.email}</p>}
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-700">{member.role}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-4 text-sm text-slate-600">Member details will appear here when available.</p>}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Tasks</h2>
            {tasks.length ? (
              <ul className="mt-4 divide-y divide-slate-100">
                {tasks.map((task) => (
                  <li key={task.id} className="py-3">
                    <p className="font-medium">{task.title || task.name || "Untitled task"}</p>
                    {task.description && <p className="mt-1 text-sm text-slate-600">{task.description}</p>}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {task.status && <span className="rounded-full bg-blue-50 px-2.5 py-1 capitalize text-blue-800">{task.status.replaceAll("_", " ")}</span>}
                      {(task.due_date || task.deadline) && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">Due {readableDate(task.due_date || task.deadline)}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-4 text-sm text-slate-600">No tasks to show yet, or the tasks endpoint isn't available yet.</p>}
          </section>
        </div>

        <p className="mt-5 text-xs text-slate-500">The backend checks project membership before returning private project details.</p>
      </div>
    </main>
  );
}
