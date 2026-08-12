import Link from "next/link";
import { requireUser } from "@/lib/dentistos-auth-server";

export const metadata = {
  title: "DentistOS",
  robots: { index: false, follow: false },
};

export default async function DentistOSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-full bg-slate-50">
      <div className="border-b border-blue-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link href="/dentistos/dashboard" className="text-lg font-extrabold text-blue-700">
              DentistOS
            </Link>
            <p className="mt-0.5 text-sm text-slate-500">
              Signed in as <span className="font-semibold text-slate-800">{user.email}</span>
            </p>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/dentistos/dashboard"
              className="rounded-md px-3 py-2 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            >
              Dashboard
            </Link>
            <Link
              href="/claim?source=dentistos-dashboard"
              className="rounded-md bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Link practice
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
