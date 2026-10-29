import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

// Import into the same realm as Zod: VM async functions produce foreign Promises.
const source = readFileSync(
  new URL('../../src/schemas/image.ts', import.meta.url),
  'utf8'
)
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
})
const schemas = await import(
  'data:text/javascript;base64,' +
    Buffer.from(
      outputText.replace("'zod'", JSON.stringify(import.meta.resolve('zod')))
    ).toString('base64')
)

for (const [name, width, height, accepted] of [
  ['16 megapixels', 4000, 4000, true],
  ['above 16 megapixels', 4001, 4000, false],
]) {
  test(`browser image validation: ${name}`, async (t) => {
    let closed = false
    globalThis.createImageBitmap = async () => ({
      width,
      height,
      close() {
        closed = true
      },
    })
    t.after(() => {
      delete globalThis.createImageBitmap
    })
    const result = await schemas.imageFileBrowserSchema.safeParseAsync(
      new File(['image'], 'photo.png', { type: 'image/png' })
    )
    assert.equal(result.success, accepted)
    assert.equal(closed, true)
  })
}
test('browser rejects images it cannot decode', async (t) => {
  globalThis.createImageBitmap = async () => {
    throw new Error('decode failed')
  }
  t.after(() => {
    delete globalThis.createImageBitmap
  })
  const result = await schemas.imageFileBrowserSchema.safeParseAsync(
    new File(['corrupt'], 'photo.png', { type: 'image/png' })
  )
  assert.equal(result.success, false)
})
