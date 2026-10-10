import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

const testDirectory = dirname(fileURLToPath(import.meta.url))

// Run the real action modules with explicit dependency doubles. No database,
// auth provider, or S3 connection is created by these tests.
export function loadModule(filename, dependencies) {
  const source = readFileSync(
    resolve(testDirectory, '../../', filename),
    'utf8'
  )
  const { outputText, diagnostics } = ts.transpileModule(source, {
    fileName: filename,
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  })
  assert.equal(diagnostics.length, 0)
  const exports = {}
  runInNewContext(
    outputText,
    {
      exports,
      require(id) {
        assert.ok(
          Object.hasOwn(dependencies, id),
          `Unexpected dependency: ${id}`
        )
        return dependencies[id]
      },
      console: { error() {} },
      URL,
      process: { env: { BUCKET_NAME: 'test-bucket' } },
    },
    { filename }
  )
  return exports
}
