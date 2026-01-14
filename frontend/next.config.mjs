/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Fixes issues with packages that try to use React Native dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pino-pretty': false,
    };
    
    // Ignore optional dependencies from MetaMask SDK
    config.externals.push('pino-pretty', '@react-native-async-storage/async-storage');
    
    return config;
  },
};

export default nextConfig;
