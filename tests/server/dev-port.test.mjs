import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createServer } from 'node:net'
import { findAvailablePort } from '../../scripts/local-port.mjs'

test('local setup selects a free port when the default is occupied', async () => {
  const occupied = createServer()
  await new Promise((resolve) => occupied.listen(0, '127.0.0.1', resolve))
  try {
    const port = occupied.address().port
    const selected = await findAvailablePort(port, 5)
    assert.notEqual(selected, port)
    assert.ok(selected > port && selected < port + 5)
  } finally {
    await new Promise((resolve) => occupied.close(resolve))
  }
})
