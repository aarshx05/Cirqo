/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  // Silence the Turbopack/webpack conflict warning from next-pwa
  turbopack: {},
};

module.exports = withPWA(nextConfig);
