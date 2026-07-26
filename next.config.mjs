/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export so the site keeps deploying to GitHub Pages
  // (box-the-third.github.io) with no server runtime.
  output: "export",

  // GitHub Pages can't run the Next image optimizer.
  images: { unoptimized: true },

  // Emit /route/index.html folders — friendlier for static hosts.
  trailingSlash: true,

  reactStrictMode: true,

  // Don't fail the production build on lint/type noise from generated code.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
