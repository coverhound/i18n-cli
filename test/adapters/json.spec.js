const subject = require(`${appPath}/adapters/json`);

const fixture = `${fixturesPath}/sample.json`;
const sample = require('fs').readFileSync(fixture, 'utf8');

describe('JSON Adapter', () => {
  describe('serialize()', () => {
    it('returns a valid json export', () => (
      expect(subject.serialize({foo: 'bar'})).to.eql(sample)
    ));
  });

  describe('read()', () => {
    it('reads JSON into a JS object', () => (
      subject.read(fixture).then((object) => (
        expect(object).to.eql({foo: 'bar'})
      ))
    ));
  });
});
