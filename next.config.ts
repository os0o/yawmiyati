import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.aladhan\.com\/.*/i,
        handler: "NetworkFirst",
        options: { cacheName: "aladhan-api", expiration: { maxAgeSeconds: 60 * 60 * 24 } },
      },
      {
        urlPattern: /^https:\/\/api\.alquran\.cloud\/.*/i,
        handler: "NetworkFirst",
        options: { cacheName: "quran-api", expiration: { maxAgeSeconds: 60 * 60 * 24 * 30 } },
      },
    ],
  },
});

// تصدير ثابت كامل (مجلد out) لاستضافته على GitHub Pages بلا خادم
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  images: { unoptimized: true },
};

export default withPWA(nextConfig);
