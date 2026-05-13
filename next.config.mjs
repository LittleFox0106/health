/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用ESLint在构建时检查
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 禁用TypeScript类型检查在构建时
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 实验性功能：允许动态导入，避免构建时静态分析
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
}

export default nextConfig
