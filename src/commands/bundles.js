const { flattenArray, toSnakeCase, tryRequire, writeFile, basename } = require('../utils');
const { authorize, sheets } = require('../sheets');

const generateLocaleExports = (adapter, outputPath, locales) => {
  const { index } = adapter;
  const localeExportPath = `${outputPath}/${index.name}`;
  const localeList = locales.map((locale) => [toSnakeCase(locale).toUpperCase(), locale]);
  const i18nIndexFile = index.generate({ list: localeList });

  return writeFile(localeExportPath, i18nIndexFile);
};

const generateBundleExports = (adapter, outputPath, files = [], locales) => {
  const { index } = adapter;
  if (!files.length) return;

  const bundleList = files.map(({ bundleName, pathName }) => (
    [bundleName, basename(pathName)])
  );

  bundleList.sort((array) => array[0]);

  const langIndexFile = index.generate({ list: bundleList, mirrorExports: true });

  return locales.map((locale) => (
    writeFile(`${outputPath}/${locale}/${index.name}`, langIndexFile)
  ));
};


const transformBundle = (adapter, output, locale, bundles) => (
  Object.keys(bundles).map(function (bundleName) {
    const pathName = `${output}/${adapter.path({ bundleName, locale })}`;
    const bundle = bundles[bundleName];
    const data = adapter.serialize(bundle, locale, bundleName);
    const bundleData = { locale, bundleName, pathName };

    return writeFile(pathName, data).then(() => Promise.resolve(bundleData));
  })
);

const transformLocaleBundles = (adapter, output, locales = [], localeBundles) => (
  flattenArray(locales.map((locale) => {
    const bundles = localeBundles[locale];
    return transformBundle(adapter, output, locale, bundles);
  }))
);

const parseRows = (locales = [], values = []) => {
  const bundles = {};
  const localeColumnIndexes = {};
  locales.forEach(function (locale) {
    // setup locales whitelist
    localeColumnIndexes[locale] = -1;
  });
  values.forEach(function (sheetRow, rowIndex) {
    const row = (sheetRow || []);
    if (rowIndex === 0) {
      row.forEach(function (locale, columnIndex) {
        // only accept valid locales
        if (localeColumnIndexes[locale]) {
          localeColumnIndexes[locale] = columnIndex;
        }
      });
    } else {
      const bundleName = row[0];
      const bKey = row[1];
      if (bundleName && bKey) {
        locales.forEach(function (locale) {
          const columnIndex = localeColumnIndexes[locale];
          if (!bundles[locale]) {
            bundles[locale] = {};
          }
          if (!bundles[locale][bundleName]) {
            bundles[locale][bundleName] = {};
          }
          bundles[locale][bundleName][bKey] = row[columnIndex];
        });
      }
    }
  });
  return bundles;
}

const downloadBundles = ({ serviceKey, spreadsheetId, sheetname, range, dir, adapter, locales }) => {
  console.log(`[${ sheetname }] authorizing access to ${ spreadsheetId }`);
  authorize(serviceKey).then((authClient) => {
    console.log(`[${ sheetname }] reading ${ spreadsheetId }`);
    return sheets.read(
      authClient, spreadsheetId, `${ sheetname }!${ range }`
    ).catch((err) => {
      console.log(`[${ sheetname }] Read error`, err);
    });
  }).then((response) => {
    const bundles = parseRows(locales, response.values);
    const { extension, serialize } = adapter;

    console.log(`[${ sheetname }] writing bundles to ${ dir }`);
    return Promise.all(
      transformLocaleBundles(adapter, dir, locales, bundles)
    ).catch((err) => console.error(`[${ sheetname }] Write error`, err));
  }).then(function (files = []) {
    files.forEach(({ bundleName, pathName }) => {
      console.log(`[${ sheetname }] wrote "${ bundleName }" - ${ pathName }`);
    });

    if (!adapter.index) return;

    console.log(`[${ sheetname }] Generating imports`);
    return Promise.all([
      generateLocaleExports(adapter, dir, locales),
      generateBundleExports(adapter, dir, files, locales),
    ]).then(function () {
      console.log(`[${ sheetname }] Finished generating importing`);
    }).catch((err) => {
      console.error(`[${ sheetname }] Error writing imports`, err);
    });
  }).catch((err) => {
    console.error(`[${ sheetname }] Authentication error`, err);
    console.error(err)
    throw err;
  });
}

module.exports = downloadBundles;
