const fs = require('fs');
const path = require('path');
const del = require('del');
const babel = require('babel-core');
const buble = require('buble');
const rollup = require('rollup');
const aliasPlugin = require('rollup-plugin-alias');
const resolvePlugin = require('rollup-plugin-node-resolve');
const babelPlugin = require('rollup-plugin-babel');
const externalsPlugin = require('rollup-plugin-auto-external');

const platforms = ['dom', 'node', 'sandbox'];
const formats = ['es', 'cjs'];

const wrapPlugin = {
  name: 'wrap',
  transformBundle(code, { format }) {
    const header =
      format === 'cjs'
        ? '\nmodule.exports = function easyStackFactory() {\n'
        : '\nexport default function easyStackFactory() {\n';
    const importText = format === 'cjs' ? 'require(' : 'import ';
    const footer = '\nreturn easyStack;\n}';

    const importIdx = code.lastIndexOf(importText);
    const firstLineIdx = code.indexOf('\n', importIdx) + 1;
    return (
      code.slice(0, firstLineIdx) + header + code.slice(firstLineIdx) + footer
    );
  }
};

function getBundles(platform) {
  const input = path.resolve('src', `index.${platform}.js`);
  const plugins = [
    babelPlugin({ exclude: 'node_modules/**' }),
    resolvePlugin(),
    externalsPlugin({ dependencies: true, peerDependecies: true })
  ];

  return formats.map(format => ({
    input: {
      input,
      plugins: platform === 'sandbox' ? plugins.concat(wrapPlugin) : plugins
    },
    output: { format }
  }));
}

async function build() {
  // Clean up the output directory
  await del(path.resolve('dist'));
  fs.mkdirSync(path.resolve('dist'));

  // Compile source code into a distributable format with Babel and Rollup
  for (const platform of platforms) {
    const bundles = getBundles(platform);

    for (const config of bundles) {
      const name = `${platform}.${config.output.format}`;
      const es6Path = path.resolve('dist', `${name}.es6.js`);
      const bundle = await rollup.rollup(config.input);
      const { code: es6Code } = await bundle.generate(config.output);
      fs.writeFileSync(es6Path, es6Code, 'utf-8');

      const es6MinPath = path.resolve('dist', `${name}.es6.min.js`);
      const { code: es6MinCode } = babel.transform(es6Code, {
        presets: ['minify']
      });
      fs.writeFileSync(es6MinPath, es6MinCode, 'utf-8');

      const es5Path = path.resolve('dist', `${name}.es5.js`);
      const { code: es5Code } = buble.transform(es6Code, {
        transforms: {
          dangerousForOf: true,
          modules: false
        }
      });
      fs.writeFileSync(es5Path, es5Code, 'utf-8');

      const es5MinPath = path.resolve('dist', `${name}.es5.min.js`);
      const { code: es5MinCode } = babel.transform(es5Code, {
        presets: ['minify']
      });
      fs.writeFileSync(es5MinPath, es5MinCode, 'utf-8');
    }
  }
}
build();
