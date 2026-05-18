import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle the dentist dataset with serverless functions so it's available at
  // runtime. The full local file (dentists-data.json) is gitignored; deployments
  // fall back to data/dentists-subset.json (committed, ~5k records).
  outputFileTracingIncludes: {
    "/": ["./data/dentists-subset.json"],
    "/dentists": ["./data/dentists-subset.json"],
    "/dentists/**": ["./data/dentists-subset.json"],
    "/api/dentists": ["./data/dentists-subset.json"],
  },
};

export default nextConfig;
