import EquipmentRoiCalculator from "./EquipmentRoiCalculator";

export const metadata = {
  title: "Equipment ROI & Break-Even Calculator",
  robots: { index: false, follow: false },
};

export default function EquipmentRoiCalculatorPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
        Equipment ROI & break-even calculator
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Model the break-even timeline and 5-year return for a new piece of equipment before you buy it.
      </p>
      <div className="mt-8">
        <EquipmentRoiCalculator />
      </div>
    </main>
  );
}
