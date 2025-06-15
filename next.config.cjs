/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: [
      'i.ibb.co',
      'mayaavigames.com',
      'public.youware.com',
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  trailingSlash: false,
  compress: true,
  poweredByHeader: false,
  // Optimize for Render deployment
  output: 'standalone',
  swcMinify: true,
  // Disable static optimization for dynamic pages
  experimental: {
    optimizePackageImports: ['framer-motion', 'react-icons'],
    serverComponentsExternalPackages: ['discord.js']
  },
  // Reduce bundle size
  modularizeImports: {
    'react-icons': {
      transform: 'react-icons/{{member}}',
    },
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // Ensure proper server startup
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  }
}

module.exports = nextConfig 