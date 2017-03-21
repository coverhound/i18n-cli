const { safeLoad, safeDump } = require('js-yaml');
const fs = require('fs');

module.exports = {
  extension: '.yml',
  path({ bundleName, locale }) {
    const shortLocale = locale.split('-')[0];
    return `${bundleName}.${shortLocale}${this.extension}`;
  },
  serialize: (bundle, locale, bundleName) => safeDump({ [locale]: { [bundleName]: bundle } }),
  read: (filepath) => (
    new Promise((resolve, reject) => {
      fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) return reject(err);
        let bundle = safeLoad(data);

        // Navigate through lang and bundle for compatibility
        bundle = bundle[Object.keys(bundle)[0]];
        bundle = bundle[Object.keys(bundle)[0]];

        resolve(bundle);
      })
    })
  ),
};
