const fs = require('fs');

module.exports = {
  extension: '.lang.json',
  path({ bundleName, locale }) {
    return `${locale}/${bundleName}${this.extension}`;
  },
  deconstructPath(path) {
    const match = /([^\/]+)\/([^\.]+)\./.exec(path);
    return { locale: match[1], bundleName: match[2] }
  },
  serialize: (bundle) => JSON.stringify(bundle, null, 2) + '\n',
  read: (filepath) => (
    new Promise((resolve, reject) => {
      fs.readFile(filepath, 'utf8', (err, data) => {
        err ? reject(err) : resolve(JSON.parse(data))
      })
    })
  ),
};
