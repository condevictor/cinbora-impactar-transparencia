/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
              protocol: "https",
              hostname: "cinbora-transparencia.s3.sa-east-1.amazonaws.com",
            },
        ]
      },
};

export default nextConfig;
