import Link from "next/link";
import { getCurrentPractice, requireUser } from "@/lib/dentistos-auth-server";

export const metadata = {
  title: "DentistOS Dashboard",
  robots: { index: false, follow: false },
};

export default async function DentistOSDashboardPage() {
  const user = await requireUser();
  const context = await getCurrentPractice();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            DentistOS Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome{user.name ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Manage your practice workspace, link your public directory listing, and prepare for
            saved Success Hub tools as they come online.
          </p>
        </section>

        <aside className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Account</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email
              </dt>
              <dd className="mt-1 break-all text-slate-800">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                User ID
              </dt>
              <dd className="mt-1 break-all font-mono text-xs text-slate-700">{user.id}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900">Practice workspace</h2>
          {context ? (
            <div className="mt-5">
              <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-4">
                <p className="text-lg font-bold text-slate-900">{context.practice.name}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {[context.practice.city, context.practice.state].filter(Boolean).join(", ") ||
                    "Location not added yet"}
                </p>
              </div>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Your role
                  </dt>
                  <dd className="mt-1 font-semibold text-slate-800">{context.membership.role}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Practice ID
                  </dt>
                  <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                    {context.practice.id}
                  </dd>
                </div>
                {context.practice.phone && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Phone
                    </dt>
                    <dd className="mt-1 text-slate-800">{context.practice.phone}</dd>
                  </div>
                )}
                {context.practice.website && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Website
                    </dt>
                    <dd className="mt-1 break-all text-slate-800">{context.practice.website}</dd>
                  </div>
                )}
              </dl>
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-blue-200 bg-slate-50 p-6">
              <h3 className="font-bold text-slate-900">No practice linked yet</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Your account is active, but it has not been connected to a practice workspace.
                Claim or link a listing to start managing practice information.
              </p>
              <Link
                href="/claim?source=dentistos-no-practice"
                className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
              >
                Claim or link a practice
              </Link>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Listing status</h2>
          {context?.listingLink ? (
            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </dt>
                <dd className="mt-1 font-semibold text-slate-800">{context.listingLink.status}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Dentist listing ID
                </dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                  {context.listingLink.dentist_id}
                </dd>
              </div>
              {context.listingLink.claim_id && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Claim ID
                  </dt>
                  <dd className="mt-1 text-slate-800">{context.listingLink.claim_id}</dd>
                </div>
              )}
            </dl>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-blue-200 bg-slate-50 p-5">
              <h3 className="font-bold text-slate-900">No claimed listing yet</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Link a public directory listing before profile-management tools are enabled.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
