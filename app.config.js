const appJson = require('./app.json');

function withoutExpoAccountFields(config) {
  const extra = { ...(config.extra ?? {}) };
  delete extra.eas;

  const nextConfig = {
    ...config,
    extra,
  };

  delete nextConfig.owner;
  delete nextConfig.updates;

  return nextConfig;
}

module.exports = () => {
  const config = { ...appJson.expo };

  if (process.env.MUSA_EXPO_GO_SERVER === '1') {
    return withoutExpoAccountFields(config);
  }

  return config;
};
