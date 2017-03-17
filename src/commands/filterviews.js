
function generateFilterViews({ serviceKey, spreadsheetId, sheetname, range, dir, adapter, locales }) {
  console.log(`[${ sheetname }] finding bundles to create filter views`);
  globLocaleBundles(locales, dir, adapter).then(function (files) {
    const bundleNames = files.map(getBundleName).sort();

    console.log(`[${ sheetname }] authorizing access to ${ spreadsheetId }`);
    authorize(serviceKey).then(function (authClient) {
      console.log(`[${ sheetname }] retreving existing sheet information`);
      sheets.retrieve(authClient, spreadsheetId).then(function(spreadsheet) {
        const sheet = spreadsheet.sheets.filter(function (sheet) {
          return sheet.properties.title === sheetname;
        })[0];
        if (sheet.filterViews && sheet.filterViews.length) {
          console.log(`[${ sheetname }] clearing existing filter views`);
          return filterViews.clear(authClient, spreadsheetId, sheet).then(function () {
            console.log(`[${ sheetname }] cleared existing filter views`);
            return Promise.resolve(sheet);
          }, function() {
            console.error(`[${ sheetname }] failed to clear existing filter views`);
            return Promise.reject();
          });
        }
        return Promise.resolve(sheet);
      }, function (err) {
        console.error(`[${ sheetname }] failed to retrieve sheet ${ spreadsheetId }\n`, err);
        return Promise.reject();
      }).then(function(sheet) {
        console.log(`[${ sheetname }] adding new filter views`);
        filterViews.create(authClient, spreadsheetId, sheet, bundleNames).then(function() {
          console.log(`[${ sheetname }] added new filter views`);
        }, function(err) {
          console.error(`[${ sheetname }] failed to add new filter views\n`, err);
        });
      });
    }, function () {
      console.error(`[${ sheetname }] failed to authorize access to ${ spreadsheetId }`);
    });
  }, function (err) {
    console.error(`[${ sheetname }]`, err);
  });
}

module.exports = generateFilterViews;
