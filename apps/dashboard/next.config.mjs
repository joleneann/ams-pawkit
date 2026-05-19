/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for monorepo: Next.js needs to transpile workspace packages
  transpilePackages: ['@pawkit/design-tokens'],
};

export default nextConfig;
