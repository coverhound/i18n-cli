const subject = require(`${appPath}/config`);
const path = require('path');

describe('configPath()', () => {
  describe('when the environment variable is defined', () => {
    const filePath = `${fixturesPath}/i18nrc`;
    before(() => process.env.REACT_I18N = filePath);
    after(() => process.env.REACT_I18N = "");

    it('uses the environment variable path', () => {
      expect(subject.configPath()).to.eql(filePath)
    });
  });

  describe('when no environment variable is defined', () => {
    it('gets the file from pwd', () => {
      const filePath = path.join(__dirname, '../.i18nrc');
      expect(subject.configPath()).to.eql(filePath);
    })
  });
});

describe('readConfig()', () => {
  before(() => process.env.REACT_I18N = `${fixturesPath}/i18nrc`);
  after(() => process.env.REACT_I18N = null);

  it('reads the configuration', () => (
    subject.readConfig().then((config) => {
      expect(config.foo).to.eql('bar');
    })
  ));
});

describe('readDefaultSettings()', () => {
  it('provides defaults', () => (
    expect(subject.readDefaultSettings().range).to.eql('A1:M1000')
  ));

  it('prefers passed in arguments', () => {
    const range = 'B2:B3';
    expect(subject.readDefaultSettings({ range }).range).to.eql(range)
  });
});

describe('readProjectSettings()', () => {
  let projectSettings;
  const config = {
    projects: { foo: { output: 'bar' } }
  };

  before(() => (
    projectSettings = subject.readProjectSettings(config, 'foo')
  ));

  it('falls back to defaults', () => (
    expect(projectSettings.range).to.eql('A1:M1000')
  ));

  it('reads project settings', () => (
    expect(projectSettings.output).to.eql('bar')
  ));
});
