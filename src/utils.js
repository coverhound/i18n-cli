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

const flattenObject = (object) => {
  const response = {};

  Object.keys(object).forEach((key) => {
    const value = object[key];

    if (!object[key]) return response;
    if (typeof value === 'string') return response[key] = value;

    const flatObject = flattenObject(value);
    Object.keys(flatObject).forEach((subKey) => {
      response[`${key}.${subKey}`] = flatObject[subKey];
    });
  });

  return response;
};

const expandObject = (object) => {
  const response = {};

  Object.keys(object).forEach((key) => {
    let current = response;
    let currentKey = "";

    key.split('.').forEach((part, index) => {
      const isArray = !isNaN(part);
      current = current[currentKey] || (current[currentKey] = isArray ? [] : {})
      currentKey = part;
    });

    current[currentKey] = object[key];
  });

  return response[''];
};

module.exports = {
  basename: path.basename,
  flattenArray,
  flattenObject,
  expandObject,
  parseAsArray,
  toSnakeCase,
  tryRequire,
  writeFile,
}
