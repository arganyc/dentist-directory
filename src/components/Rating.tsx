export default function Rating({ value, count }: { value: number; count?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-1 text-sm">
      <div className="flex" aria-label={`${value} out of 5 stars`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const isFull = i < full;
          const isHalf = i === full && half;
          return (
            <svg
              key={i}
              viewBox="0 0 20 20"
              className={`h-4 w-4 ${isFull || isHalf ? "text-amber-400" : "text-slate-300"}`}
              aria-hidden
            >
              {isHalf ? (
                <>
                  <defs>
                    <linearGradient id={`half-${i}`}>
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="#cbd5e1" />
                    </linearGradient>
                  </defs>
                  <path
                    fill={`url(#half-${i})`}
                    d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9z"
                  />
                </>
              ) : (
                <path
                  fill="currentColor"
                  d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9z"
                />
              )}
            </svg>
          );
        })}
      </div>
      <span className="font-semibold text-slate-900">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-slate-500">({count})</span>}
    </div>
  );
}
