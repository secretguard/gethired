"use client";

import { useState } from "react";
import type { McqResult } from "@/lib/mcq";
import type { RoleKey } from "@/lib/roles";
import { Button } from "./ui/Button";

type SendStatus = "idle" | "sending" | "sent" | "error";

/** Same UX pattern as EmailReportForm (CV Screener), sending the already-scored
 * McqResult directly since quiz results aren't persisted server-side to look up
 * by id — see app/api/send-quiz-report's own docs. */
export function EmailQuizResultForm({ result, role }: { result: McqResult; role: RoleKey }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SendStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage(null);

    try {
      const response = await fetch("/api/send-quiz-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, result }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong sending that email.");
        return;
      }

      setStatus("sent");
      setMessage("Result sent! Check your inbox.");
    } catch {
      setStatus("error");
      setMessage("Could not reach the server. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col items-center gap-3">
      <div className="flex w-full gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-lg border border-slate/30 bg-paper px-3 py-2 text-sm text-ink placeholder:text-slate/60 transition-all duration-150 ease-standard focus:border-beacon focus:shadow-[var(--shadow-focus)] focus:outline-none"
        />
        <Button type="submit" disabled={status === "sending"} className="px-4 py-2">
          {status === "sending" && (
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {status === "sending" ? "Sending…" : "Email me this result"}
        </Button>
      </div>
      {message && (
        <p className={`animate-fade-up text-sm ${status === "error" ? "text-danger" : "text-verified"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
