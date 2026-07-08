type LogoMarkProps = {
  tone?: "light" | "dark";
};

export default function LogoMark({ tone = "light" }: LogoMarkProps) {
  const bg = tone === "dark" ? "from-blue-500 to-cyan-400" : "from-blue-600 to-cyan-500";
  const ring = tone === "dark" ? "ring-white/15" : "ring-blue-200/70";

  return (
    <span
      aria-hidden
      className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${bg} text-white shadow-sm ring-1 ${ring}`}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="h-7 w-7"
        role="img"
      >
        <path
          d="M16 5.6c-2-2-4.8-2.4-6.7-1.2-2.7 1.7-3.1 5.2-2.2 8.7.5 2.1 1.3 4.3 2.1 6.2.7 1.7 2 3 3.4 3 1.3 0 2-.9 2.6-2.7.3-.9.6-1.5.8-1.9.2.4.5 1 .8 1.9.6 1.8 1.3 2.7 2.6 2.7 1.4 0 2.7-1.3 3.4-3 .8-1.9 1.6-4.1 2.1-6.2.9-3.5.5-7-2.2-8.7-1.9-1.2-4.7-.8-6.7 1.2Z"
          fill="white"
        />
        <path
          d="M20.6 18.8c2.6 0 4.7 2 4.7 4.5 0 3.2-4.7 6.7-4.7 6.7s-4.7-3.5-4.7-6.7c0-2.5 2.1-4.5 4.7-4.5Z"
          fill="#0f766e"
          stroke="white"
          strokeWidth="1.2"
        />
        <circle cx="20.6" cy="23.2" r="1.35" fill="white" />
        <path
          d="M12.4 10.4c1.4 1 2.8 1.5 4.2 1.5 1.2 0 2.2-.3 3.1-.9"
          stroke="#1d4ed8"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity=".55"
        />
      </svg>
    </span>
  );
}
