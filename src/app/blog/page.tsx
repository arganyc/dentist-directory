import Link from "next/link";
import { blogPosts } from "@/lib/blog";

export const metadata = {
  title: "Dental Health Blog",
  description:
    "Expert-written articles on dental health, treatment options, and finding the right dentist. Evidence-based guidance from licensed practitioners.",
};

export default function BlogIndex() {
  return (
    <div className="bg-slate-50">
      <div className="border-b border-blue-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <nav className="text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-700">
              Home
            </Link>{" "}
            / <span className="text-slate-700">Blog</span>
          </nav>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Dental Health Blog
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Practical, evidence-based articles written by licensed dentists. Everything from
            preventive care to navigating treatment decisions.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {blogPosts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="block rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md sm:p-8"
            >
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                  {p.category}
                </span>
                <span className="text-slate-500">{p.readTime}</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">{p.date}</span>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-slate-900 group-hover:text-blue-700">
                {p.title}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">{p.excerpt}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">By {p.author}</span>
                <span className="text-sm font-semibold text-blue-700">Read article →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
