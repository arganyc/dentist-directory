import NewPatientCacCalculator from "./NewPatientCacCalculator";

export const metadata = {
  title: "New Patient Acquisition Cost Calculator",
  robots: { index: false, follow: false },
};

export default function NewPatientCacCalculatorPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
        New patient acquisition cost calculator
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Divide marketing spend by new patients gained, then compare it to patient lifetime value.
      </p>
      <div className="mt-8">
        <NewPatientCacCalculator />
      </div>
    </main>
  );
}
