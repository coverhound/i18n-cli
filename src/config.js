const { parseAsArray } = require('./lib');

const configPath = () => (
  process.env.REACT_I18N || `${process.cwd()}/.i18nrc`
);

const readConfig = () => (
  new Promise((resolve, reject) => {
    try {
      const config = require(configPath());
      resolve(config);
    } catch(e) {
      reject(e);
    }
  }
));

const readDefaultSettings = (config) => {
  const defaults = Object.assign({}, {
    output: './tmp',
    range: 'A1:M1000',
    locales: ['en-US'],
    filename: `i18n-${new Date().getTime()}.csv`,
    type: 'module',
  }, config);

  if (!defaults.path) defaults.path = defaults.output;

  return defaults;
};

const readProjectSettings = (config, name) => {
  const defaults = readDefaultSettings(config);
  const project = config.projects && name && config.projects[name];

  if (!project) return defaults;
  if(project.locales) {
    project.locales = parseAsArray(project.locales);
  }

  return Object.assign({}, defaults, project);
}

module.exports = {
  configPath,
  readConfig,
  readDefaultSettings,
  readProjectSettings,
};
