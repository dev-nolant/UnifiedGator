"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

type Status = "todo" | "in_progress" | "done";
type Task = {
  id: string;
  title: string;
  status: Status;
  due_date: string | null;
  assignee_id: string | null;
  created_by: string | null;
};
type Person = { id: string; name: string };

const COLUMNS: [Status, string][] = [
  ["todo", "To do"],
  ["in_progress", "In progress"],
  ["done", "Done"],
];

export default function Tasks(props: { projectId: string; people: Person[]; me: string; owner: boolean; onChange: () => void }) {
  const { projectId, people, me, owner, onChange } = props;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api<Task[]>(`/projects/${projectId}/tasks`).then(setTasks).catch((e) => setError(e.message));
  }, [projectId]);

  useEffect(load, [load]);

  async function run(fn: () => Promise<unknown>) {
    setError("");
    try {
      await fn();
      load();
      onChange();
    } catch (e: any) {
      setError(e.message);
    }
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      await api(`/projects/${projectId}/tasks`, {
        method: "POST",
        body: JSON.stringify({ title, assignee_id: assignee || null, due_date: dueDate || null }),
      });
      setTitle("");
      setAssignee("");
      setDueDate("");
    });
  }

  function move(id: string, status: string) {
    run(() => api(`/projects/${projectId}/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }));
  }

  function remove(id: string) {
    run(() => api(`/projects/${projectId}/tasks/${id}`, { method: "DELETE" }));
  }

  const nameOf = (id: string | null) => people.find((p) => p.id === id)?.name ?? "unassigned";

  return (
    <section className="mt-8">
      <h2 className="mb-2 text-lg font-semibold">Tasks</h2>

      <form onSubmit={add} className="mb-4 flex flex-wrap gap-2">
        <input
          className="flex-1 rounded border p-2"
          placeholder="What needs doing?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <select className="rounded border p-2" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          <option value="">unassigned</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input className="rounded border p-2" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <button className="rounded bg-uf-blue px-4 text-white">Add</button>
      </form>
      {error && <p className="mb-2 text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map(([status, label]) => (
          <div
            key={status}
            className="min-h-32 rounded bg-gray-50 p-2"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const id = e.dataTransfer.getData("text/plain");
              const task = tasks.find((t) => t.id === id);
              if (task && task.status !== status) move(id, status);
            }}
          >
            <h3 className="mb-2 font-medium">{label}</h3>
            {tasks
              .filter((t) => t.status === status)
              .map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
                  className="mb-2 cursor-grab rounded border bg-white p-2 text-sm"
                >
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-gray-500">
                    {nameOf(t.assignee_id)}
                    {t.due_date && `, due ${t.due_date}`}
                  </p>
                  <div className="mt-1 flex justify-between">
                    <select className="text-xs" value={t.status} onChange={(e) => move(t.id, e.target.value)}>
                      {COLUMNS.map(([s, l]) => (
                        <option key={s} value={s}>
                          {l}
                        </option>
                      ))}
                    </select>
                    {(owner || t.created_by === me) && (
                      <button onClick={() => remove(t.id)} className="text-xs text-red-600 hover:underline">
                        delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </section>
  );
}
