import Link from "next/link";
import { requireUser } from "@/lib/dentistos-auth-server";
import ClaimLinkForm from "./ClaimLinkForm";

export const metadata = {
  title: "Link Claim to DentOS",
  robots: { index: false, follow: false },
};

function pickString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function DentistOSLinkClaimPage(props: PageProps<"/dentistos/link-claim">) {
  await requireUser();
  const searchParams = await props.searchParams;
  const token = pickString(searchParams.token).trim();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <nav className="text-sm text-slate-500">
        <Link href="/dentistos/dashboard" className="hover:text-blue-700">
          DentOS
        </Link>{" "}
        / <span className="text-slate-700">Link claim</span>
      </nav>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
        Connect your claimed listing
      </h1>
      <p className="mt-3 text-slate-600">
        Existing claim links can be connected to DentOS while the original member tools access
        flow remains unchanged.
      </p>
      <div className="mt-8">
        {token ? (
          <ClaimLinkForm token={token} />
        ) : (
          <div className="rounded-xl border border-dashed border-blue-200 bg-slate-50 p-6">
            <h2 className="font-bold text-slate-900">No claim token provided</h2>
            <p className="mt-2 text-sm text-slate-600">
              Open this page from a valid claim link to connect a listing to DentOS.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
