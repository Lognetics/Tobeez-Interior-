import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The development toolbar covered the signed-in user controls in the sidebar.
  // Compile and runtime errors still surface when the indicator is disabled.
  devIndicators: false,
};

export default nextConfig;
