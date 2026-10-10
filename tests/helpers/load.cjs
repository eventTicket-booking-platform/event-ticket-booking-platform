const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');

// Run actual TypeScript modules with explicitly controlled boundary dependencies.
function load(file, dependencies = {}, globals = {}) {
  const loadedModule = { exports: {} };
  const source = ts.transpileModule(readFileSync(path.join(__dirname, '../..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(source, {
    module: loadedModule, exports: loadedModule.exports, crypto, Headers, Response, FormData, atob, ...globals,
    require: (name) => {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error('Unexpected test dependency: ' + name);
    },
  }, { filename: file });
  return loadedModule.exports;
}

module.exports = { load };
