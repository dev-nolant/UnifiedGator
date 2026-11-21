"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

type Message = {
    id: string;
    project_id: string;
    sender_id: string;
    content: string;
    created_at: string;
    sender: {
        id: string;
        email: string;
        display_name: string | null;
    };
};

export default function TeamChat({
    projectId,
}: {
    projectId: string;
}) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const loadMessages = useCallback(async () => {
        try {
            const data = await api<Message[]>(
                `/projects/${projectId}/messages`
            );
            setMessages(data);
            setError("");
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Could not load messages"
            );
        }
    }, [projectId]);

    useEffect(() => {
        void loadMessages();

        const interval = window.setInterval(() => {
            void loadMessages();
        }, 4000);

        return () => window.clearInterval(interval);
    }, [loadMessages]);

    async function sendMessage(e: FormEvent) {
        e.preventDefault();

        const content = draft.trim();

        if (!content || sending) return;

        setSending(true);
        setError("");

        try {
            await api<Message>(
                `/projects/${projectId}/messages`,
                {
                    method: "POST",
                    body: JSON.stringify({ content }),
                }
            );

            setDraft("");
            await loadMessages();
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "Could not send message"
            );
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {open && (
                <div className="mb-3 flex h-[450px] w-[min(360px,calc(100vw-3rem))] flex-col overflow-hidden rounded-md border bg-white shadow-xl">

                    <div className="flex items-center justify-between bg-uf-blue p-4 text-white">
                        <h2 className="font-semibold">Team Chat</h2>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-sm"
                            aria-label="Close chat"
                        >
                            Close
                        </button>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto p-4">
                        {messages.length === 0 ? (
                            <p className="text-center text-sm text-gray-500">
                                No messages yet. Start the conversation!
                            </p>
                        ) : (
                            messages.map((message) => (
                                <div key={message.id}>
                                    <div className="flex flex-wrap items-baseline gap-2">
                                        <span className="text-sm font-semibold">
                                            {message.sender?.display_name ||
                                                message.sender?.email ||
                                                "Unknown user"}
                                        </span>

                                        <span className="text-xs text-gray-400">
                                            {new Date(
                                                message.created_at
                                            ).toLocaleTimeString([], {
                                                hour: "numeric",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>

                                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-700">
                                        {message.content}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {error && (
                        <p className="px-3 text-xs text-red-600">
                            {error}
                        </p>
                    )}

                    <form
                        onSubmit={sendMessage}
                        className="flex gap-2 border-t p-3"
                    >
                        <input
                            className="min-w-0 flex-1 rounded-lg border p-2 text-sm"
                            placeholder="Write a message..."
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            maxLength={2000}
                            disabled={sending}
                        />

                        <button
                            type="submit"
                            disabled={sending || !draft.trim()}
                            className="rounded-md bg-uf-blue px-3 text-sm text-white disabled:opacity-50"
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    onClick={() => setOpen((value) => !value)}
                    className="flex items-center gap-2 rounded-lg bg-uf-blue px-5 py-3 font-semibold text-white shadow-lg hover:opacity-90"
                >
                    <span>Chat</span>
                    <span>{open ? "-" : "+"}</span>
                </button>
            </div>
        </div>
    );
}