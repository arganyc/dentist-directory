import StaffCostRatioCalculator from "./StaffCostRatioCalculator";

export const metadata = {
  title: "Staff Cost Ratio Calculator",
  robots: { index: false, follow: false },
};

export default function StaffCostRatioCalculatorPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
        Staff cost ratio calculator
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Check total payroll as a percentage of collections against the healthy benchmark range.
      </p>
      <div className="mt-8">
        <StaffCostRatioCalculator />
      </div>
    </main>
  );
}
