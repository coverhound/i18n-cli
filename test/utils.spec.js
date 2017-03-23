const subject = require(`${appPath}/utils`);

const arrayString = 'foo.bar.baz';
const array = ['foo', 'bar', 'baz'];

describe('parseAsArray()', () => {
  describe('given a string', () => {
    it('parses it', () => (
      expect(subject.parseAsArray(arrayString, '.')).to.eql(array)
    ));
  });

  describe('given an array', () => {
    it('leaves it', () => (
      expect(subject.parseAsArray(array)).to.eql(array)
    ));
  });
});

describe('flattenObject()', () => {
  const object = { foo: { bar: [ "baz" ] } };

  const flatObject = {
    "foo.bar.0": "baz"
  };

  it('expands objects', () => {
    expect(subject.flattenObject(object)).to.eql(flatObject);
  });
});

describe('expandObject()', () => {
  const flatObject = { "foo.bar.0": "baz" };
  const object = { foo: { bar: [ "baz" ] } };

  it('flattens objects', () => {
    expect(subject.expandObject(flatObject)).to.eql(object);
  });
});

describe('toSnakeCase()', () => {
  const kebabCase = 'some-words-go-here';
  const camelCase = 'someWordsGoHere';
  const snakeCase = 'some_words_go_here';

  describe('given camelCase', () => {
    it('underscores it', () => (
      expect(subject.toSnakeCase(camelCase)).to.eql(snakeCase)
    ));
  });

  describe('given kebab-case', () => {
    it('underscores it', () => (
      expect(subject.toSnakeCase(kebabCase)).to.eql(snakeCase)
    ));
  });
});

describe('writeFile()', () => {
  const fs = require('fs');
  const samplePath = 'foo/bar/baz.js';
  const sampleDir = 'foo/bar';
  const sampleData = '{}';

  before(() => {
    sinon.stub(subject.writeFile, 'mkdirp').callsArg(1).once;
    sinon.stub(fs, 'writeFile').once;
  });

  after(() => {
    subject.writeFile.mkdirp.restore();
    fs.writeFile.restore();
  });

  it('writes the file', () => {
    subject.writeFile(samplePath, sampleData);
    sinon.assert.calledWith(subject.writeFile.mkdirp, sampleDir);
    sinon.assert.calledWith(fs.writeFile, samplePath, sampleData);
  });
});
