"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "sent" | "error";

function friendlyError(code?: string): string {
  if (code === "invalid_email") return "Please enter a valid email address.";
  if (code === "login_request_failed") {
    return "We couldn't send the secure sign-in link right now. Please try again in a moment.";
  }
  return "Unable to send the login link. Please try again.";
}

export default function LoginForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const email = data.get("email");

    try {
      const response = await fetch("/api/dentistos/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !body.success) {
        setStatus("error");
        setError(friendlyError(body.error));
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
        <h2 className="text-lg font-bold">Check your email</h2>
        <p className="mt-2 text-sm">
          We sent a secure DentOS sign-in link. It expires shortly and can only be used once.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
      {status === "error" && error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
      <label htmlFor="email" className="block text-sm font-semibold text-slate-800">
        Work email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@practice.com"
        className="mt-1.5 block w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-5 w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {status === "submitting" ? "Sending link..." : "Email me a secure link"}
      </button>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        No password required. Your session is stored in a secure HttpOnly cookie.
      </p>
    </form>
  );
}
