import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/app/i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
  rewrites: async () => {
    return [
      // Full PocketBase proxy — avoids CORS and mixed-content (HTTP PB from HTTPS Vercel).
      // PocketBase client uses /pb-api as base URL on the browser;
      // Next.js forwards /pb-api/:path* → http://34.56.67.158:8090/:path*
      {
        source: '/pb-api/:path*',
        destination: 'http://34.56.67.158:8090/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);