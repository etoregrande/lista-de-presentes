import { mkdtempSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const bin = process.env.POSTGRES_BIN_DIR ?? '/Library/PostgreSQL/17/bin'
const directory = mkdtempSync(join(tmpdir(), 'presenteio-pg-test-'))
const data = join(directory, 'data')
const sockets = join(directory, 'sockets')
mkdirSync(sockets)
const port = 54891
const databaseUrl = `postgresql://testuser@localhost:${port}/presenteio_test?host=${encodeURIComponent(sockets)}`
let started = false

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { env, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0)
    throw new Error(`${command} failed (${result.status})`)
}

try {
  run(join(bin, 'initdb'), [
    '-D',
    data,
    '-U',
    'testuser',
    '-A',
    'trust',
    '--no-locale',
    '-E',
    'UTF8',
  ])
  run(join(bin, 'pg_ctl'), [
    '-D',
    data,
    '-l',
    join(directory, 'postgres.log'),
    '-o',
    `-h '' -k ${sockets} -p ${port}`,
    '-w',
    'start',
  ])
  started = true
  run(join(bin, 'createdb'), [
    '-h',
    sockets,
    '-p',
    String(port),
    '-U',
    'testuser',
    'presenteio_test',
  ])
  // Explicitly override DATABASE_URL only in the migration subprocess. Never
  // load the application database URL or reuse an existing database.
  run(resolve('node_modules/.bin/prisma'), ['migrate', 'deploy'], {
    ...process.env,
    DATABASE_URL: databaseUrl,
  })
  run(
    process.execPath,
    ['--test', 'tests/integration/group-transactions.test.mjs'],
    { ...process.env, TEST_DATABASE_URL: databaseUrl }
  )
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  if (started) {
    const result = spawnSync(
      join(bin, 'pg_ctl'),
      ['-D', data, '-m', 'immediate', '-w', 'stop'],
      { stdio: 'inherit' }
    )
    if (result.status !== 0) {
      console.error(
        `Temporary PostgreSQL could not stop; retained ${directory}`
      )
      process.exitCode = 1
    } else {
      rmSync(directory, { recursive: true, force: true })
    }
  } else {
    rmSync(directory, { recursive: true, force: true })
  }
}
