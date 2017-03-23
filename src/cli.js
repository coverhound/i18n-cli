const lib = require('./lib');
const { readConfig, readProjectSettings } = require('./config');

const cli = (config) => (
  require('yargs')
    .usage('$0 <cmd> [args]')
    .demand(1)
    .command('bundles <project>', 'Converts Google sheet rows to a i18n lang files.', {}, (argv) => {
      const settings = readProjectSettings(config, argv.project);
      require('./commands/bundles')(settings);
    })
    .command('csv <project>', 'Generates a CSV file that can be added to the Google Sheet.', {}, (argv) => {
      const settings = readProjectSettings(config, argv.project);
      require('./commands/csv')(settings);
    })
    .command('filterviews <project>', 'Adds the filters views to the Google Sheet', {}, (argv) => {
      const settings = readProjectSettings(config, argv.project);
      require('./commands/filterviews')(settings);
    })
    .command({
      command: 'version',
      aliases: ['v'],
      desc: 'i18n cli tool version',
      handler: function () {
        const { version } = require(`${ __dirname }/../package.json`);
        console.log(`i18n-cli v${version}`);
      },
    })
    .help()
    .argv
);

module.exports = () => readConfig().then(cli).catch((err) => {
  console.error('ERROR: runtime config file cannot be found!\n\n');
  cli({});
});
