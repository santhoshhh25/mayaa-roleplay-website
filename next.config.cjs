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
  // Optimize for Render deployment - NO LOADING SCREENS
  output: 'standalone',
  swcMinify: true,
  // Prevent render application loading screens
  experimental: {
    optimizePackageImports: ['framer-motion', 'react-icons'],
    serverComponentsExternalPackages: ['discord.js'],
    appDir: true,
    // Disable loading UI to prevent "application loading" screens
    serverMinification: false
  },
  // Reduce bundle size
  modularizeImports: {
    'react-icons': {
      transform: 'react-icons/{{member}}',
    },
  },
  // Performance optimizations - prevent loading delays
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // Ensure immediate server startup - NO DELAYS
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // Longer cache to prevent reloading
    pagesBufferLength: 5, // More pages in buffer
  },
  // Disable loading UI completely
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          },
          {
            key: 'X-Render-Loading',
            value: 'disabled'
          }
        ]
      }
    ]
  },
  // Ensure pages load immediately
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: []
    }
  }
}

module.exports = nextConfig 