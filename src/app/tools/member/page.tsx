import Link from "next/link";
import { MEMBER_TOOLS } from "@/lib/memberTools";

export default function MemberToolsHubPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Your practice tools</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Free calculators for your daily operations. Numbers stay in your browser — nothing is
        saved to your listing.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MEMBER_TOOLS.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/member/${tool.slug}`}
            className="flex flex-col rounded-lg border border-blue-100 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <h2 className="font-bold text-slate-900">{tool.shortTitle}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{tool.description}</p>
            <span className="mt-4 text-sm font-semibold text-blue-700">Open calculator →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
