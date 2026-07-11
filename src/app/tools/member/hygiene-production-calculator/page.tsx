import HygieneProductionCalculator from "./HygieneProductionCalculator";

export const metadata = {
  title: "Hygiene Production Per Hour Calculator",
  robots: { index: false, follow: false },
};

export default function HygieneProductionCalculatorPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
        Hygiene production per hour calculator
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Estimate production per hygiene chair hour and compare it to a common benchmark.
      </p>
      <div className="mt-8">
        <HygieneProductionCalculator />
      </div>
    </main>
  );
}
