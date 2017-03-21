const { parseAsArray } = require('./utils');
const adapters = require('./adapters');

const configPath = () => (
  process.env.REACT_I18N || `${process.cwd()}/.i18nrc`
);

const readServiceKey = (config) => {
  if (typeof config.serviceKey !== 'string') return Promise.resolve(config);

  return adapters.json.read(config.serviceKey).then((key) => {
    config.serviceKey = key;
    return config;
  });
};

const readDefaultSettings = (config) => {
  const defaults = Object.assign({}, {
    dir: './tmp',
    range: 'A1:M1000',
    locales: ['en-US'],
    csvFile: `i18n-${new Date().getTime()}.csv`,
    format: 'commonjs',
  }, config);

  return defaults;
};

const readConfig = () => (
  adapters.commonjs.read(configPath()).then(readServiceKey).then(readDefaultSettings)
);

const readProjectSettings = (config, name) => {
  const project = config.projects && name && config.projects[name];

  if (!project) return config;
  if(project.locales) {
    project.locales = parseAsArray(project.locales);
  }

  const projectConfig = Object.assign({}, config, project);
  projectConfig.adapter = adapters[projectConfig.format];

  return projectConfig;
}

module.exports = {
  configPath,
  readConfig,
  readDefaultSettings,
  readProjectSettings,
};
