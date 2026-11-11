"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
// useEffect useState and api used to load/save selected theme after the header.
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

// theme choices, shown in drop down menu
const THEMES = ["gator", "forest", "ocean"] as const;

// function to add the theme
function addTheme(theme: string) {
    // add theme in browser
    document.documentElement.dataset.theme = theme;
    // set in local storage ug-theme
    localStorage.setItem("ug-theme", theme);
}

export default function Header() {
    const router = useRouter();
    // header will have which option is shown
    const [theme, setTheme] = useState("gator");
    // useEffect savedTheme, api in /me
    useEffect(() => {
        const savedTheme = localStorage.getItem("ug-theme");
        if (savedTheme) {
            // set the theme
            setTheme(savedTheme);
            // add theme to page
            addTheme(savedTheme);
        }
        api<{ theme?: string }>("/me")
            .then((me) => {
                // if /me is not the theme
                if (!me.theme) return;
                // set and add the theme
                setTheme(me.theme);
                addTheme(me.theme);
            })
            .catch(() => {});
    }, []);

    // theme used to revert back if failure when swapping
    function chooseTheme(next: string) {
        // swap theme, save PATCH in /me, and revert to old theme for failure
        const previousTheme = theme;
        // set theme, add theme
        setTheme(next);
        addTheme(next);
        api("/me", {method: "PATCH", body: JSON.stringify({ theme : next}) }).catch(() => {
            // swet the previous theme
            setTheme(previousTheme);
            addTheme(previousTheme);
        });
    }
    // logout function
    async function logout() {
        localStorage.removeItem("ug-theme");
        delete document.documentElement.dataset.theme;
        // remove ug-theme and data-theme, signout
        await supabase.auth.signOut();
        router.push("/login");
    }
    // return the page, Unified Gator link, them selection dropdown, and the logout
    return (
        <header className="flex items-center justify-between border-b-4 border-uf-orange px-6 py-3">
            <Link href="/dashboard" className="text-xl font-bold text-uf-blue">
                Unified Gator
            </Link>
            <div className="flex items-center gap-4">
                <label className={"text-sm text-gray-600"}>
                    Theme{" "}
                    <select className="rounded border p-1" value={theme} onChange={(e)=> chooseTheme(e.target.value)}>
                    {THEMES.map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                    </select>
                </label>
                <button onClick={logout} className="text-sm text-gray-600 hover:underline">
                Log out
                </button>
            </div>
        </header>
    );
}
