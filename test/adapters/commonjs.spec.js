const subject = require(`${appPath}/adapters/commonjs`);

const fixture = `${fixturesPath}/sample.js`;
const sample = require('fs').readFileSync(fixture, 'utf8');

describe('CommonJS Adapter', () => {
  describe('serialize()', () => {
    it('returns a valid commonjs export', () => (
      expect(subject.serialize({foo: 'bar'})).to.eql(sample)
    ));
  });

  describe('read()', () => {
    it('reads a commonjs module into a JS object', () => (
      subject.read(fixture).then((object) => (
        expect(object).to.eql({foo: 'bar'})
      ))
    ));
  });
});
