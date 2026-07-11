import CaseAcceptanceCalculator from "./CaseAcceptanceCalculator";

export const metadata = {
  title: "Case Acceptance & Lost Treatment Value Calculator",
  robots: { index: false, follow: false },
};

export default function CaseAcceptanceCalculatorPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
        Case acceptance & lost treatment value calculator
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Turn your treatment-plan acceptance rate into a dollar figure for what&apos;s walking out
        the door unaccepted.
      </p>
      <div className="mt-8">
        <CaseAcceptanceCalculator />
      </div>
    </main>
  );
}
