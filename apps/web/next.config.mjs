/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@mandya-realestate/shared'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
