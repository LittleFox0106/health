/** @type {import('next').NextConfig} */
const nextConfig = {
  // API路由不进行静态优化，避免构建时连接数据库
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
};

export default nextConfig;
