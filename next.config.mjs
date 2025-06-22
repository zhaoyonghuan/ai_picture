/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'midjourney-plus.oss-us-west-1.aliyuncs.com',
      'res.cloudinary.com'  // 添加 Cloudinary 域名支持
    ],
  },
};

export default nextConfig;
