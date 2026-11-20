// Run after a production build. Uses a disposable database and a local browser.
import assert from 'node:assert/strict'
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { join, resolve } from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { createHmac, randomBytes, randomInt } from 'node:crypto'
import { chromium, expect } from '@playwright/test'
import pg from 'pg'

const bin =
  process.env.POSTGRES_BIN_DIR ?? '/opt/homebrew/opt/postgresql@17/bin'
const directory = mkdtempSync('/private/tmp/presenteio-follow-')
const artifacts = resolve('outputs/reports/follow')
mkdirSync(artifacts, { recursive: true })
const sockets = join(directory, 'sockets')
mkdirSync(sockets)
const dbPort = randomInt(20000, 40000)
const appPort = randomInt(40000, 60000)
const baseURL = `http://127.0.0.1:${appPort}`
const databaseUrl = `postgresql://testuser@localhost:${dbPort}/presenteio_follow_test?host=${encodeURIComponent(sockets)}`
const env = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  BETTER_AUTH_URL: baseURL,
  BETTER_AUTH_SECRET: randomBytes(32).toString('hex'),
  BUCKET_DOMAIN: 'example.invalid',
  GOOGLE_CLIENT_ID: '',
  GOOGLE_CLIENT_SECRET: '',
}
let databaseStarted = false
let server
let browser
let pool

function run(command, args) {
  const result = spawnSync(command, args, { env, encoding: 'utf8' })
  if (result.error || result.status !== 0)
    throw new Error(
      `${result.stderr || String(result.error) || result.stdout}\n${
        command.endsWith('pg_ctl')
          ? readFileSync(join(directory, 'postgres.log'), 'utf8')
          : ''
      }`
    )
}

try {
  run(join(bin, 'initdb'), [
    '-D',
    join(directory, 'data'),
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
    join(directory, 'data'),
    '-l',
    join(directory, 'postgres.log'),
    '-o',
    `-h '' -k ${sockets} -p ${dbPort}`,
    '-w',
    'start',
  ])
  databaseStarted = true
  run(join(bin, 'createdb'), [
    '-h',
    sockets,
    '-p',
    String(dbPort),
    '-U',
    'testuser',
    'presenteio_follow_test',
  ])
  run(resolve('node_modules/.bin/prisma'), ['migrate', 'deploy'])
  pool = new pg.Pool({ connectionString: databaseUrl })
  const now = new Date()
  for (const [id, name] of [
    ['alice', 'Ana Teste'],
    ['bob', 'Beto Teste'],
  ]) {
    await pool.query(
      'INSERT INTO users (id, "createdAt", "updatedAt", name, email, "emailVerified") VALUES ($1,$2,$2,$3,$4,true)',
      [id, now, name, `${id}@example.test`]
    )
  }
  const token = randomBytes(24).toString('hex')
  await pool.query(
    'INSERT INTO sessions (id, "createdAt", "updatedAt", "expiresAt", token, "userId") VALUES ($1,$2,$2,$3,$4,$5)',
    ['alice-session', now, new Date(Date.now() + 86400000), token, 'alice']
  )

  server = spawn(
    process.execPath,
    [
      'node_modules/next/dist/bin/next',
      'start',
      '--hostname',
      '127.0.0.1',
      '--port',
      String(appPort),
    ],
    { env, stdio: 'ignore' }
  )
  let ready = false
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${baseURL}/login`)).ok) {
        ready = true
        break
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  assert.ok(ready, 'Next server started')

  browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto(`${baseURL}/wishlist/shared/bob`)
  await expect(
    page.getByRole('button', { name: 'Seguir', exact: true })
  ).toBeVisible()
  await page.screenshot({ path: join(artifacts, 'shared-before.png') })
  await page.getByRole('button', { name: 'Seguir', exact: true }).click()
  await expect(page).toHaveURL(/\/login\?callbackUrl=/)
  const callbackUrl = new URL(page.url()).searchParams.get('callbackUrl')
  assert.equal(callbackUrl, '/wishlist/shared/bob')

  await context.addCookies([
    {
      name: 'better-auth.session_token',
      value: encodeURIComponent(
        `${token}.${createHmac('sha256', env.BETTER_AUTH_SECRET).update(token).digest('base64')}`
      ),
      domain: '127.0.0.1',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ])
  await page.goto(`${baseURL}${callbackUrl}`)
  await expect(page.getByText('Seguindo', { exact: true }).last()).toBeVisible()
  await expect(page.getByRole('link', { name: /Beto Teste/ })).toBeVisible()
  await page.screenshot({ path: join(artifacts, 'following.png') })
  assert.equal(
    (
      await pool.query(
        'SELECT count(*) FROM user_follows WHERE "followerId"=$1 AND "followedId"=$2',
        ['alice', 'bob']
      )
    ).rows[0].count,
    '1'
  )

  await page.getByRole('button', { name: 'Deixar de seguir' }).click()
  await expect(
    page.getByRole('button', { name: 'Seguir', exact: true })
  ).toBeVisible()
  assert.equal(
    (await pool.query('SELECT count(*) FROM user_follows')).rows[0].count,
    '0'
  )

  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Seguir', exact: true })
  ).toBeVisible()
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  )
  await page.screenshot({ path: join(artifacts, 'mobile.png') })
  assert.deepEqual(errors, [])
  writeFileSync(
    join(artifacts, 'results.json'),
    JSON.stringify(
      {
        result: 'pass',
        scenarios: [
          'login return',
          'automatic follow',
          'sidebar',
          'unfollow',
          'mobile',
        ],
        errors,
      },
      null,
      2
    )
  )
  console.log(
    'Follow browser flow passed: login return, automatic follow, sidebar, unfollow, mobile'
  )
} finally {
  await browser?.close()
  server?.kill('SIGTERM')
  await pool?.end()
  if (databaseStarted) {
    run(join(bin, 'pg_ctl'), [
      '-D',
      join(directory, 'data'),
      '-m',
      'immediate',
      '-w',
      'stop',
    ])
  }
  rmSync(directory, { recursive: true, force: true })
}
