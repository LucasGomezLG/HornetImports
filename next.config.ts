import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPages ? "/HornetImports" : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? "/HornetImports" : "",
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
