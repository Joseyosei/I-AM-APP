/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'Permissions-Policy', value: 'microphone=(self)' }],
      },
    ]
  },
}
module.exports = nextConfig
