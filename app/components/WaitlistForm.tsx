"use client";

import { useState, useRef } from "react";

export default function WaitlistForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "landing" }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message);
      }
    } catch {
      setStatus("error");
      setMessage("Noe gikk galt. Prøv igjen senere.");
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-xs font-medium text-zinc-600">E-post</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="andy@eksempel.no"
        disabled={status === "loading"}
        className="h-12 rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-400 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={status === "loading" || !email.trim()}
        onClick={() => formRef.current?.requestSubmit()}
        className="relative z-20 h-12 overflow-hidden rounded-xl bg-zinc-900 text-sm font-medium text-white touch-manipulation hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="relative z-10 pointer-events-none">
          {status === "loading" ? "Sender..." : "Meld meg på"}
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-[-30%] w-[30%] bg-white/10 blur-md animate-[shimmer_2.5s_linear_infinite]"
        />
      </button>

      {message && (
        <p
          className={`text-sm ${
            status === "success" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      {status === "idle" && (
        <p className="text-xs text-zinc-500">
          Vi sender kun oppdateringer om SmartBytt.
        </p>
      )}
    </form>
  );
}
