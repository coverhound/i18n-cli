const path = require('path');
const { getBundleName, globLocaleBundles } = require('../lib');
const { writeFile } = require('../utils');

const mergeArrays = (arr1, arr2) => [].concat.apply(arr1, arr2);

const convertRow = (array = []) => (
  rowData = array.map((item) => JSON.stringify(item)).join(',') + '\n'
);

const createFileTransform = (adapter, filepath, bundle) => {
  const { locale, bundleName } = adapter.deconstructPath(filepath);
  return Promise.resolve([locale, bundleName, bundle]);
};

const readLocaleBundles = (files = [], locales, basepath, adapter) => (
  Promise.all(
    files.map((filePath) => {
      return adapter.read(path.join(basepath, filePath)).
        then(createFileTransform.bind(this, adapter, filePath))
    })
  ).then((rows = []) => {
    const csvMap = {};

    rows.forEach(function (row) {
      const locale = row[0];
      const bName = row[1];
      const bundle = row[2];

      Object.keys(bundle).forEach(function (bKey) {
        const bMsg = bundle[bKey];
        if (!csvMap[`${ bName }.${ bKey }`]) {
          csvMap[`${ bName }.${ bKey }`] = {};
          csvMap[`${ bName }.${ bKey }`]._meta = {
            bName: bName,
            bKey: bKey,
          };
        }
        csvMap[`${ bName }.${ bKey }`][locale] = bMsg;
      });
    });

    const csv = Object.keys(csvMap).sort().map(function (mapKey) {
      const row = csvMap[mapKey];
      return convertRow(
        mergeArrays([row._meta.bName, row._meta.bKey],
        locales.map((locale) => row[locale])
      ));
    }).join('');

    return (convertRow(mergeArrays(['bundle', 'key'], locales)) + csv);
  })
);

const generateCSV = ({ sheetname, adapter, dir, csvFile, locales }) => {
  console.log(`[${ sheetname }] finding bundles files`);
  globLocaleBundles(locales, dir, adapter).then(function(files) {
    console.log(`[${ sheetname }] reading the bundles data`);
    readLocaleBundles(files, locales, dir, adapter).then(function (data) {
      console.log(`[${ sheetname }] writing data to CSV`);
      writeFile(csvFile, data).then(function () {
        console.log(`[${ sheetname }] wrote CSV - ${ csvFile }`);
      }, function (err) {
        console.error(`[${ sheetname }] error writing CSV`);
      });
    }, function (err) {
      console.error(`[${ sheetname }] error reading bundles`);
    });
  }, function() {
    console.error(`[${ sheetname }] error finding bundles`);
  });
};

module.exports = generateCSV;
