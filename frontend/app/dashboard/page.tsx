"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { api } from "@/lib/api";

type Project = { id: string; name: string; description: string; due_date: string | null };

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState("");
  const [userDisplay, setUsername] = useState(""); /* display username on dashboard */
  const [nameFilter, setNameFilter] = useState(""); /* text in name filter */

  useEffect(() => {
    api<Project[]>("/projects").then(setProjects).catch((e) => setError(e.message));
    /* get email and username from api */
    api<{display_name: string | null; email: string }>("/me")
        .then((me) => setUsername(me.display_name || me.email))
        .catch(() => {});
  }, []);
  /* color according to date constants. en-CA for date YYYY-MM-DD format */
  const today = new Date().toLocaleDateString("en-CA");
  /* calculate weekAfter, 7 days after today */
  const weekAfterDate = new Date();
  weekAfterDate.setDate(weekAfterDate.getDate() + 7);
  const weekAfter = weekAfterDate.toLocaleDateString("en-CA");

  const shownProjects = projects
      /* filter project name, trim out space/go to lowercase */
      ?.filter((p) => p.name.toLowerCase().includes(nameFilter.trim().toLowerCase()))
      /* sort projects by due date */
      ?.sort((a,b) => {
        /* dateRank 0 has date/before today, 1 has date/date is today or later, 2 due_date null/has no date */
        const dateRank = (due: string | null) => (due ? (due < today ? 0 : 1) : 2);
        /* compare a and b due_date */
        return dateRank(a.due_date) - dateRank(b.due_date) || (a.due_date ?? "").localeCompare(b.due_date ?? "");
      });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          {/* Display username's Projects and Project Count in title */}
          <h1 className="text-2xl font-semibold">
              {userDisplay ? `${userDisplay}'s Projects` : "Your Projects"}
              {projects ? ` (${projects.length})` : ""}</h1>
          <Link href="/projects/new" className="rounded bg-uf-blue px-4 py-2 text-white">
            New project
          </Link>
        </div>
          {/* Filter Projects by Name Box */}
          <input
          className="mb-4 w-full rounded border p-2"
          placeholder="Filter by Name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />

        {/* load has failed. show error msg and retry button */}
        {error && (
            <p className="text-red-600">
              {error}{" "}
              <button className="underline" onClick={() => api<Project[]>("/projects").then(setProjects).catch((e) => setError(e.message))}>
                Retry
              </button>
            </p>
        )}
        {!projects && !error && <p className="text-gray-500">loading...</p>}
        {/* no projects and link to create project */}
        {projects?.length === 0 && (
            <p className="text-gray-500">
              no projects yet. <Link href="/projects/new" className="underline">Create project</Link>
            </p>
        )}
        {/* no projects match */}
        {projects && projects.length > 0 && shownProjects?.length === 0 && <p className="text-gray-500"> no projects match</p>}

        <ul className="grid gap-3 sm:grid-cols-2">
          {shownProjects?.map((p) => (
            <li key={p.id}>
              {/* color projects border according to dates (red for overdue, green if within a week, and orange on hover otherwise)*/}
              <Link href={`/projects/${p.id}`} className={`block rounded border p-4 ${p.due_date && p.due_date >= today && p.due_date <= weekAfter ? "border-green-600" : "hover:border-uf-orange"} ${p.due_date && p.due_date < today ? "border-red-600" : ""}`}>
                <p className="font-medium">{p.name}</p>
                {p.description && <p className="text-sm text-gray-600">{p.description}</p>}
                  {/* red when overdue, green text due through the next 7 days, and gray when more than 7 days or no due date  */}
                <p className={`mt-2 text-xs ${p.due_date && p.due_date < today ? "text-red-600" : p.due_date && p.due_date <= weekAfter ? "text-green-600" : "text-gray-500"}`}>
                  {/* text with dates */}
                  {p.due_date && p.due_date < today ? `overdue ${p.due_date}` : p.due_date ? `due ${p.due_date}` : "no due date"}

                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
