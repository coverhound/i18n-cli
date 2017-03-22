const path = require('path');
const fs = require('fs');
const WRITE_OPTS = { encoding: 'utf8' };

function writeFile (filename, data) {
  return new Promise((resolve, reject) => {
    const basepath = path.dirname(filename);
    writeFile.mkdirp(basepath, (err) => {
      if (err) return reject(err);

      fs.writeFile(filename, data, WRITE_OPTS, (err) => {
        err ? reject(err) : resolve()
      });
    });
  })
};

// for testing :(
writeFile.mkdirp = require('mkdirp');

const parseAsArray = (array, split) => (
  (typeof array === 'string') ? array.split(split || ',') : array
);

const REGEX_CAMEL_CASE = /([a-z])([A-Z])/g;
const REGEX_KEBAB_CASE = /([^-])-([^-])/g;
const toSnakeCase = (str) => (
  (str || '')
    .replace(REGEX_CAMEL_CASE, '$1_$2')
    .replace(REGEX_KEBAB_CASE, '$1_$2')
    .toLowerCase()
);

const tryRequire = (path) => fs.existsSync(path) && require(path);

const flattenArray = (array) => (
  array.reduce((flatArray, subArray) => flatArray.slice().concat(subArray), [])
);

module.exports = {
  basename: path.basename,
  flattenArray,
  parseAsArray,
  toSnakeCase,
  tryRequire,
  writeFile,
}
