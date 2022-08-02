/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "Content-Security-Policy",
          value: "frame-ancestors 'none'",
        },
      ],
    },
    {
      source: "/:path*",
      has: [
        { type: "query", key: "shop", value: "(?<shopName>.*).myshopify.com" },
      ],
      headers: [
        {
          key: "Content-Security-Policy",
          value:
            "frame-ancestors https://:shopName.myshopify.com https://admin.shopify.com;",
        },
      ],
    },
  ],
};

module.exports = nextConfig;
