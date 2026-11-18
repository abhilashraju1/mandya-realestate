/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@mandya-realestate/shared'],
  output: 'export',
  images: {
    unoptimized: true, // Required for Cloudflare Pages static export
  },
  trailingSlash: false,
};

export default nextConfig;
