"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "linked" | "error";

export default function ClaimLinkForm({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function linkClaim() {
    setStatus("submitting");
    setError("");

    try {
      const response = await fetch("/api/dentistos/claims/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !body.success) {
        setStatus("error");
        setError(body.error || "Unable to link claim.");
        return;
      }
      setStatus("linked");
      window.location.href = "/dentistos/dashboard";
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
      {status === "error" && error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
      <h2 className="text-lg font-bold text-slate-900">Link this claim to DentOS</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        This uses your existing claim link to connect the matching public dentist listing to your
        signed-in DentOS account.
      </p>
      <button
        type="button"
        onClick={linkClaim}
        disabled={status === "submitting" || status === "linked" || !token}
        className="mt-5 w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {status === "submitting" ? "Linking..." : status === "linked" ? "Linked" : "Link claim"}
      </button>
    </div>
  );
}
