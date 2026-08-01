"use client";

import { useState } from "react";

type SendStatus = "idle" | "sending" | "sent" | "error";

export function EmailReportForm({ resultId }: { resultId: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SendStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage(null);

    try {
      const response = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultId, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong sending that email.");
        return;
      }

      setStatus("sent");
      setMessage("Report sent! Check your inbox.");
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
          className="flex-1 rounded-lg border border-slate/30 bg-paper px-3 py-2 text-sm text-ink placeholder:text-slate/60 focus:border-beacon focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Email me this report"}
        </button>
      </div>
      {message && <p className={`text-sm ${status === "error" ? "text-beacon" : "text-verified"}`}>{message}</p>}
    </form>
  );
}
