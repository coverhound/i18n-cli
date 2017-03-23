const GOOGLE_APIS_SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const google = require('googleapis');
const { spreadsheets } = google.sheets('v4');

const authorize = (serviceKey) => {
  if (!serviceKey) return Promise.reject('auth params do not exist');

  const jwtClient = new google.auth.JWT(serviceKey.client_email, null, serviceKey.private_key, GOOGLE_APIS_SCOPES, null);

  return new Promise((resolve, reject) => {
    jwtClient.authorize((err, data) => {
      if (err) return reject(err);
      resolve(jwtClient);
    });
  });
};

const retrieveSheets = (auth, spreadsheetId) => {
  const request = { auth, spreadsheetId };

  return new Promise((resolve, reject) => {
    spreadsheets.get(request, (err, spreadsheet) => {
      if (err) return reject(err);
      resolve(spreadsheet);
    });
  })
};

const readSheet = (auth, spreadsheetId, range) => {
  const request = { auth, spreadsheetId, range };

  return new Promise((resolve, reject) => {
    spreadsheets.values.get(request, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  })
};

// not used anywhere
const writeSheet = (auth, spreadsheetId, range, rows) => {
  const request = { auth, spreadsheetId, range, valueInputOption: 'RAW' };
  const body = { range, majorDimension: 'ROWS', values: rows };

  return new Promise((resolve, reject) => {
    spreadsheets.values.append(request, { body }, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  })
};

const clearFilterViews = (auth, spreadsheetId, sheet) => {
  const resource = {
    "requests": sheet.filterViews.map((filter) => ({
      deleteFilterView: { filterId: filter.filterViewId }
    })),
  };
  const request = { auth, spreadsheetId, resource };

  return new Promise((resolve, reject) => {
    spreadsheets.batchUpdate(request, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
};

const createFilterViews = (auth, spreadsheetId, sheet, bundleNames) => {
  const resource = {
    "requests": bundleNames.map((bundleName, index) => ({
      addFilterView: {
        filter: {
          title: bundleName,
          range: {
            sheetId: sheet.properties.sheetId,
            startRowIndex: 0,
            endRowIndex: 1000,
            startColumnIndex: 0,
            endColumnIndex: 24,
          },
          criteria: {
            "0": {
              "condition": {
                "type": "TEXT_EQ",
                "values": [
                  {
                    "userEnteredValue": bundleName,
                  }
                ]
              }
            }
          }
        },
      },
    })),
  }
  const request = { auth, spreadsheetId, resource };

  return new Promise(function(resolve, reject) {
    spreadsheets.batchUpdate(request, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
};

module.exports = {
  authorize,
  sheets: {
    retrieve: retrieveSheets,
    read: readSheet,
    write: writeSheet,
  },
  filterViews: {
    clear: clearFilterViews,
    create: createFilterViews,
  }
};
