const glob = require('glob');

const REGEX_BUNDLE_NAME = /([^\/.]+).+/i;
const getBundleName = (filepath) => {
  const match = REGEX_BUNDLE_NAME.exec(filepath);
  return match.pop();
}

const globLocaleBundles = (locales, basepath, adapter) => {
  const fileFilter = adapter.index ? new RegExp(`(?!${ adapter.index.name })$/`) : /.*/;

  return new Promise(function (resolve, reject) {
    glob(`**/*${ adapter.extension }`, {
      cwd: basepath,
    }, (err, files) => {
      if (err) return reject(err);
      resolve((files || []).filter((file) => fileFilter.test(file)));
    });
  });
}

module.exports = {
  getBundleName,
  globLocaleBundles,
};
