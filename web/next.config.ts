import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/app/i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
  rewrites: async () => {
    return [
      {
        source: '/api/pocketbase/:path*',
        destination: 'http://34.56.67.158:8090/api/:path*',
      },
      {
        source: '/api/files/:collection/:id/:filename',
        destination: 'http://34.56.67.158:8090/api/files/:collection/:id/:filename',
      },
    ];
  },
};

export default withNextIntl(nextConfig);