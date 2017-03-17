const { flattenArray, toSnakeCase, tryRequire, writeFile } = require('../utils');
const { authorize, sheets } = require('../sheets');

const generateLocaleExports = (adapter, outputPath, locales) => {
  const { index } = adapter;
  const localeExportPath = `${outputPath}/${index.name}`;
  const existingLocales = tryRequire(localeExportPath);

  if (existingLocales) {
    const existingLocaleKeys = Object.keys(existingLocales).sort();

    if (
      locales.length === existingLocaleKeys.length &&
      locales.sort().every((loc, idx) => loc === existingLocaleKeys[idx])
    ) return;
  }

  const localeList = locales.map((locale) => [toSnakeCase(locale).toUpperCase(), locale]);
  const i18nIndexFile = index.generate({ list: localeList });

  return writeFile(localeExportPath, i18nIndexFile);
}

const generateBundleExports = (adapter, outputPath, files, locales) => {
  const { index } = adapter;
  if (!files || !files.length || files.every(f => !f.newFile)) return;

  const bundleList = (files || []).map((file) => (
    [file.bundleName, file.fileName]
  ));

  bundleList.sort((array) => array[0]);

  const langIndexFile = index.generate({ list: bundleList, mirrorExports: true });

  return locales.map((locale) => (
    writeFile(`${outputPath}/${locale}/${index.name}`, langIndexFile)
  ));
}


function transformBundle(ext, serializer, output, locale, bundles) {
  return Object.keys(bundles).map(function (bundleName) {
    const bundleFile = `${ bundleName }${ ext }`;
    const bundlePath = `${ output }/${ locale }/${ bundleFile }`;
    const bundle = bundles[bundleName];
    const data = serializer(bundle);

    const existingBundle = tryRequire(bundlePath);

    const bundleData = {
      locale: locale,
      bundleName: bundleName,
      fileName: bundleFile,
      output: bundlePath,
      newFile: !existingBundle,
      changed: false
    }

    // no need to regenerate a bundle that has not been modified
    if (existingBundle && JSON.stringify(existingBundle) === JSON.stringify(bundle)) {
      bundleData.changed = false;
      return Promise.resolve(bundleData);
    }

    return writeFile(bundlePath, data).then(function () {
      bundleData.changed = true;
      return Promise.resolve(bundleData);
    }, function (err) {
      return Promise.reject(err);
    });
  });
}

const transformLocaleBundles = (extension, serializer, output, locales = [], localeBundles) => (
  flattenArray(locales.map((locale) => {
    const bundles = localeBundles[locale];
    return transformBundle(extension, serializer, output, locale, bundles);
  }))
);

function parseRows(locales = [], values = []) {
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
      transformLocaleBundles(extension, serialize, dir, locales, bundles)
    ).catch((err) => console.error(`[${ sheetname }] Write error`, err));
  }).then(function (files = []) {
    files.forEach((o) => {
      console.log(`[${ sheetname }] wrote "${ o.bundleName }" - ${ o.output }`);
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
