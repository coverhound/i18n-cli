module.exports = {
  extension: '.lang.js',
  path({ bundleName, locale }) {
    return `${locale}/${bundleName}${this.extension}`;
  },
  serialize: (bundle) => `module.exports = ${JSON.stringify(bundle, null, 2)};\n`,
  read: (filepath) => (
    new Promise((resolve, reject) => {
      try {
        const data = require(filepath);
        resolve(data);
      } catch(err) {
        reject(err)
      }
    })
  ),
  index: {
    name: 'index.js',
    generate: ({ list, mirrorExports = false }) => {
      const imports = [];
      const exports = [];

      list.forEach((item) => {
        const [varName, fileName] = item;

        imports.push(`const ${varName} = require('./${fileName}');`);
        const exp = mirrorExports ? `  ${varName},` : `  '${fileName}': ${varName},`;
        exports.push(exp);
      });

      return `${imports.join('\n')}\n\nmodule.exports = {\n${exports.join('\n')}\n}\n`;
    },
  },
};
