const subject = require(`${appPath}/adapters/rails`);

const fixture = `${fixturesPath}/sample.yml`;
const sample = require('fs').readFileSync(fixture, 'utf8');

describe('YAML Adapter', () => {
  describe('path()', () => {
    it('returns a rails filepath', () => (
      expect(subject.path({ bundleName: 'users', locale: 'en-US' })).to.eql('users.en-US.yml')
    ));
  });

  describe('deconstructPath()', () => {
    it('returns a commonjs filepath', () => (
      expect(subject.deconstructPath('users.en-US.yml')).to.eql({ bundleName: 'users', locale: 'en-US' })
    ));
  });

  describe('serialize()', () => {
    it('returns a valid YAML export', () => (
      expect(subject.serialize({ foo: 'bar' }, 'en', 'baz')).to.eql(sample)
    ));
  });

  describe('read()', () => {
    it('reads YAML into a JS object', () => (
      subject.read(fixture).then((object) => (
        expect(object).to.eql({ foo: 'bar' })
      ))
    ));
  });
});
