import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
}

export default nextConfig
