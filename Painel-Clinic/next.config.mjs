import webpack from 'webpack'

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,
  exprContextCritical: false,
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: ['pg', 'pg-native', 'pg-hstore']
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: true,
        locale: false
      }
    ]
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: '/api/(.*)',

        // Headers
        headers: [
          // Allow for specific domains to have access or * for all
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'

            // DOES NOT WORK
            // value: process.env.ALLOWED_ORIGIN,
          },

          // Allows for specific methods accepted
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },

          // Allows for specific headers accepted (These are a few standard ones)
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ]
  },
  api: {
    bodyParser: false
  },
  webpack: config => {
    config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^pg-native$/ }))

    return config
  },

  // TODO: below line is added to resolve twice event dispatch in the calendar reducer
  reactStrictMode: false
}

export default nextConfig
