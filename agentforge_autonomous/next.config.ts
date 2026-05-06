import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // child_process and fs are Node.js built-ins — they must never be bundled for the browser.
      // PipelineAgent uses them server-side only; mark them external to silence webpack errors.
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "child_process",
        "fs",
      ];
    }
    return config;
  },
};

export default nextConfig;
