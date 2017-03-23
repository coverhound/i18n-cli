const logger = require('../logger');
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
  logger.info('csv.run');
  logger.info('csv.findBundles', { sheetname });

  globLocaleBundles(locales, dir, adapter).catch((err) => {
    logger.error('csv.findBundles', err, { sheetname });
  }).then((files) => {
    logger.info('csv.readBundles', { sheetname });
    return readLocaleBundles(files, locales, dir, adapter).catch((err) => {
      logger.error('csv.readBundles', err, { sheetname });
    });
  }).then((data) => {
    logger.info('csv.write', { sheetname });
    return writeFile(csvFile, data).catch((err) => {
      logger.error('csv.write', err, { sheetname });
    });
  }).then(() => {
    logger.info('csv.done', { sheetname, csvFile });
  });
};

module.exports = generateCSV;
