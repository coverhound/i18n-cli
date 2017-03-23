const logger = require('../logger');
const { globLocaleBundles, getBundleName } = require('../lib');
const { authorize, sheets, filterViews } = require('../sheets');

function generateFilterViews({ serviceKey, spreadsheetId, sheetname, range, dir, adapter, locales }) {
  logger.info('filterviews.run');
  logger.info('filterviews.findBundles', { sheetname });

  globLocaleBundles(locales, dir, adapter).catch((err) => {
    logger.error('filterviews.findBundles', err, { sheetname });
  }).then((files) => {
    const bundleNames = files.map(getBundleName).sort();

    logger.info('filterviews.auth', { sheetname, spreadsheetId });
    return authorize(serviceKey).catch((err) => {
      logger.error('filterviews.auth', err, { sheetname, spreadsheetId });
    }).then((authClient) => ({ authClient, bundleNames }));
  }).then(({ authClient, bundleNames }) => {
    logger.info('filterviews.retrieve', { sheetname, spreadsheetId });
    return sheets.retrieve(authClient, spreadsheetId).catch((err) => {
      logger.error('filterviews.retrieve', err, { sheetname });
    }).then((spreadsheet) => {
      const sheet = spreadsheet.sheets.filter((sheet) => sheet.properties.title === sheetname)[0];
      if (!sheet.filterViews || !sheet.filterViews.length) return Promise.resolve(sheet);

      logger.info('filterviews.clearing', { sheetname });
      return filterViews.clear(authClient, spreadsheetId, sheet).catch((err) => {
        logger.error('filterviews.clearing', err, { sheetname });
      }).then(() => Promise.resolve(sheet));
    }).then((sheet) => {
      logger.info('filterviews.cleared', { sheetname });
      return Promise.resolve(sheet);
    }).then((sheet) => {
      logger.info('filterviews.add', { sheetname });
      return filterViews.create(authClient, spreadsheetId, sheet, bundleNames).catch((err) => {
        logger.error('filterviews.add', { sheetname });
      });
    }).then(() => {
      logger.info('filterviews.added', { sheetname });
    });
  });
};

module.exports = generateFilterViews;
