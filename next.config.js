/** @type {import('next').NextConfig} */
const nextConfig = {
  // Выключено намеренно: со строгим режимом в разработке сокеты
  // подключались бы дважды и создавали лишние игровые комнаты.
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    // node:sqlite — встроенный модуль Node, не даём сборщику его паковать
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({ "node:sqlite": "commonjs node:sqlite" });
    }
    return config;
  },
};

module.exports = nextConfig;
