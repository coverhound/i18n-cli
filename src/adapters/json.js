const fs = require('fs');

module.exports = {
  extension: '.lang.json',
  serialize: (bundle) => JSON.stringify(bundle, null, 2) + '\n',
  read: (filepath) => (
    new Promise((resolve, reject) => {
      fs.readFile(filepath, 'utf8', (err, data) => {
        err ? reject(err) : resolve(JSON.parse(data))
      })
    })
  ),
};
