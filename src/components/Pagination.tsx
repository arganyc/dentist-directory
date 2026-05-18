import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string>;
};

function buildHref(basePath: string, params: Record<string, string>, targetPage: number): string {
  const sp = new URLSearchParams(params);
  if (targetPage <= 1) sp.delete("page");
  else sp.set("page", String(targetPage));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const window: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) window.push("…");
  for (let i = start; i <= end; i++) window.push(i);
  if (end < total - 1) window.push("…");
  window.push(total);
  return window;
}

export default function Pagination({ page, totalPages, basePath, searchParams }: Props) {
  if (totalPages <= 1) return null;
  const pages = pageWindow(page, totalPages);
  const prevHref = buildHref(basePath, searchParams, page - 1);
  const nextHref = buildHref(basePath, searchParams, page + 1);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-sm text-slate-600">
        Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
        <span className="font-semibold text-slate-900">{totalPages.toLocaleString()}</span>
      </p>

      <div className="flex items-center gap-1">
        {hasPrev ? (
          <Link
            href={prevHref}
            className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
          >
            ← Prev
          </Link>
        ) : (
          <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400">
            ← Prev
          </span>
        )}

        <ul className="mx-1 flex items-center gap-1">
          {pages.map((p, i) =>
            p === "…" ? (
              <li
                key={`gap-${i}`}
                className="px-2 text-sm text-slate-400"
                aria-hidden
              >
                …
              </li>
            ) : (
              <li key={p}>
                {p === page ? (
                  <span
                    aria-current="page"
                    className="block min-w-[2.25rem] rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white"
                  >
                    {p}
                  </span>
                ) : (
                  <Link
                    href={buildHref(basePath, searchParams, p)}
                    className="block min-w-[2.25rem] rounded-md border border-blue-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {p}
                  </Link>
                )}
              </li>
            )
          )}
        </ul>

        {hasNext ? (
          <Link
            href={nextHref}
            className="rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
          >
            Next →
          </Link>
        ) : (
          <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400">
            Next →
          </span>
        )}
      </div>
    </nav>
  );
}
