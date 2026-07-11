import InsuranceWriteoffCalculator from "./InsuranceWriteoffCalculator";

export const metadata = {
  title: "Insurance Write-Off Impact Calculator",
  robots: { index: false, follow: false },
};

export default function InsuranceWriteoffCalculatorPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
        Insurance write-off impact calculator
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        See how much of your billed production gets written off across payer fee schedules.
      </p>
      <div className="mt-8">
        <InsuranceWriteoffCalculator />
      </div>
    </main>
  );
}
