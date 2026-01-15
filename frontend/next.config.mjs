/** @type {import('next').NextConfig} */
const nextConfig = {
  // Reduce initial JS bundle size
  experimental: {
    optimizePackageImports: ['lucide-react', '@rainbow-me/rainbowkit'],
  },
  
  webpack: (config, { isServer }) => {
    // Fix issues with packages that try to use React Native dependencies
    // This is required for MetaMask SDK which imports React Native modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pino-pretty': false,
      'lokijs': false,
      'encoding': false,
    };
    
    // Provide empty modules for React Native dependencies
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };
    
    // Ignore optional pino-pretty dependency
    config.externals = [...(config.externals || [])];
    if (!isServer) {
      config.externals.push({
        'pino-pretty': 'pino-pretty',
      });
    }
    
    return config;
  },
  
  // Transpile these packages to avoid ESM issues
  transpilePackages: ['@rainbow-me/rainbowkit'],
};

export default nextConfig;
