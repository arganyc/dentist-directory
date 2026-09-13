import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Login to DentOS",
  description: "Sign in to DentOS with a secure email magic link.",
  robots: { index: false, follow: false },
};

function pickString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const verified = pickString(searchParams.verified) === "1";
  const invalidLink = pickString(searchParams.error) === "invalid_link";

  return (
    <div className="bg-slate-50">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <section>
          <nav className="text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-700">
              Home
            </Link>{" "}
            / <span className="text-slate-700">Login</span>
          </nav>
          <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-blue-700">
            DentOS
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
            Sign in to your practice workspace
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            DentOS uses secure email links for practice access. Your existing claim links and member
            tools continue to work separately.
          </p>
          {verified && (
            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              You are signed in to DentOS.
            </div>
          )}
          {invalidLink && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              That sign-in link is invalid, expired, or already used. Request a new one.
            </div>
          )}
        </section>

        <LoginForm />
      </div>
    </div>
  );
}
