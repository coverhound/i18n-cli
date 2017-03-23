const log = {
  bundles: {
    run: 'Downloading bundles from Google Sheets...',
    auth: ({ sheetname, spreadsheetId }) => `[${ sheetname }] authorizing access to ${ spreadsheetId }`,
    read: ({ sheetname, spreadsheetId }) => `[${ sheetname }] reading ${ spreadsheetId }`,
    write: ({ sheetname, dir }) => `[${ sheetname }] writing bundles to ${ dir }`,
    wrote: ({ sheetname, bundleName, pathName }) => `[${ sheetname }] wrote "${ bundleName }" - ${ pathName }`,
    imports: ({ sheetname }) => `[${ sheetname }] Generating imports`,
    done: ({ sheetname }) => `[${ sheetname }] Finished generating importing`,
  },
  csv: {
    run: 'Generating the CSV for upload to Google Sheets...',
    findBundles: ({ sheetname }) => `[${sheetname}] finding bundles files`,
    readBundles: ({ sheetname }) => `[${ sheetname }] reading the bundles data`,
    write: ({ sheetname }) => `[${ sheetname }] writing data to CSV`,
    done: ({ sheetname, csvFile }) => `[${ sheetname }] wrote CSV - ${ csvFile }`,
  },
  filterviews: {
    run: 'Update the filterview on the Google Sheet...',
    findBundles: ({ sheetname }) => `[${ sheetname }] finding bundles to create filter views`,
    auth: ({ sheetname, spreadsheetId }) => `[${ sheetname }] authorizing access to ${ spreadsheetId }`,
    retrieve: ({ sheetname }) => `[${ sheetname }] retreving existing sheet information`,
    clearing: ({ sheetname }) => `[${ sheetname }] clearing existing filter views`,
    cleared: ({ sheetname }) => `[${ sheetname }] cleared existing filter views`,
    add: ({ sheetname }) => `[${ sheetname }] adding new filter views`,
    added: ({ sheetname }) => `[${ sheetname }] added new filter views`,
  },
};

const error = {
  bundles: {
    auth: ({ sheetname }) => `[${ sheetname }] Authentication error`,
    read: ({ sheetname }) => `[${ sheetname }] Read error`,
    write: ({ sheetname }) => `[${ sheetname }] Write error`,
    imports: ({ sheetname }) => `[${ sheetname }] Error writing imports`,
  },
  csv: {
    findBundles: ({ sheetname }) => `[${ sheetname }] error finding bundles`,
    readBundles: ({ sheetname }) => `[${ sheetname }] error reading bundles`,
    write: ({ sheetname }) => `[${ sheetname }] error writing CSV`,
  },
  filterviews: {
    findBundles: ({ sheetname }) => `[${ sheetname }] failed to find bundles`,
    auth: ({ sheetname, spreadsheetId }) => `[${ sheetname }] failed to authorize access to ${ spreadsheetId }`,
    retrieve: ({ sheetname, spreadsheetId }) => `[${ sheetname }] failed to retrieve sheet ${ spreadsheetId }\n`,
    clearing: ({ sheetname }) => `[${ sheetname }] failed to clear existing filter views`,
    add: ({ sheetname }) => `[${ sheetname }] failed to add new filter views\n`,
  },
};

const findValue = (list, key, args) => {
  const value = key.split('.').reduce((acc, item) => acc[item], list);
  return args ? value(args) : value;
};

module.exports = {
  info: (key, args) => console.log(findValue(log, key, args)),
  error: (key, err, args) => {
    console.error(findValue(error, key, args));
    throw err;
  },
};
