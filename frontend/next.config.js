/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure Next.js does not look for TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
