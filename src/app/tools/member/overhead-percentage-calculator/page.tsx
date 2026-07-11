import OverheadCalculator from "./OverheadCalculator";

export const metadata = {
  title: "Overhead Percentage Calculator",
  robots: { index: false, follow: false },
};

export default function OverheadPercentageCalculatorPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
        Overhead percentage calculator
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        See your overhead as a share of collections and compare it to the industry benchmark.
      </p>
      <div className="mt-8">
        <OverheadCalculator />
      </div>
    </main>
  );
}
