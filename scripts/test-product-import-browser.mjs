// Run after npm run build. Uses a disposable local database, never DATABASE_URL.
import assert from 'node:assert/strict'
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  appendFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { chromium, expect } from '@playwright/test'
import pg from 'pg'
import sharp from 'sharp'

const bin =
  process.env.POSTGRES_BIN_DIR ?? '/opt/homebrew/opt/postgresql@17/bin'
const directory = mkdtempSync(join(tmpdir(), 'presenteio-browser-'))
const data = join(directory, 'data')
const sockets = join(directory, 'sockets')
mkdirSync(sockets)
const artifacts = resolve('outputs/product-import-browser')
mkdirSync(artifacts, { recursive: true })
const port = 54902
const baseURL = 'http://127.0.0.1:3107'
const databaseUrl = `postgresql://testuser@127.0.0.1:${port}/presenteio_browser_test`
const env = {
  ...process.env,
  DATABASE_URL: databaseUrl,
  BETTER_AUTH_URL: baseURL,
  BETTER_AUTH_SECRET: randomBytes(32).toString('hex'),
  RESEND_API_KEY: '',
  NEXT_PUBLIC_PASSWORD_RECOVERY_ENABLED: 'false',
  NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED: 'false',
  MERCADOLIVRE_ADMIN_EMAIL: '',
  MERCADOLIVRE_CLIENT_SECRET: '',
  MERCADOLIVRE_TOKEN_SECRET: '',
  BUCKET_KEY: 'browser-test-only',
  BUCKET_SECRET_KEY: 'browser-test-only',
  BUCKET_REGION: 'us-east-1',
  BUCKET_NAME: 'browser-test-only',
  BUCKET_DOMAIN: 'example.invalid',
  GOOGLE_CLIENT_ID: '',
  GOOGLE_CLIENT_SECRET: '',
}
let started = false,
  server,
  browser,
  pool,
  page
const passed = []
const errors = []
function run(command, args, childEnv = env) {
  const p = spawnSync(command, args, { env: childEnv, encoding: 'utf8' })
  if (p.error || p.status !== 0)
    throw new Error(`${command}: ${p.stderr || p.error || p.stdout}`)
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
    `-h 127.0.0.1 -k ${sockets} -p ${port}`,
    '-w',
    'start',
  ])
  started = true
  run(join(bin, 'createdb'), [
    '-h',
    '127.0.0.1',
    '-p',
    String(port),
    '-U',
    'testuser',
    'presenteio_browser_test',
  ])
  run(resolve('node_modules/.bin/prisma'), ['migrate', 'deploy'])
  pool = new pg.Pool({ connectionString: databaseUrl })
  writeFileSync(join(artifacts, 'server.log'), '')
  server = spawn(
    process.execPath,
    [
      'node_modules/next/dist/bin/next',
      'start',
      '--hostname',
      '127.0.0.1',
      '--port',
      '3107',
    ],
    { env, stdio: ['ignore', 'pipe', 'pipe'] }
  )
  for (const stream of [server.stdout, server.stderr])
    stream.on('data', (chunk) =>
      appendFileSync(join(artifacts, 'server.log'), chunk)
    )
  let ready = false
  for (let i = 0; i < 90; i++) {
    if (server.exitCode !== null)
      throw new Error('Next server exited; see server.log')
    try {
      if (
        (await fetch(`${baseURL}/login`, { signal: AbortSignal.timeout(3000) }))
          .ok
      ) {
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
  const auth = {
    email: 'browser@example.com',
    password: 'BrowserTest123!',
    name: 'Teste Importação',
  }
  const signup = await context.request.post(
    `${baseURL}/api/auth/sign-up/email`,
    { data: auth, headers: { origin: baseURL } }
  )
  assert.ok(signup.ok(), `signup ${signup.status()}`)
  const signin = await context.request.post(
    `${baseURL}/api/auth/sign-in/email`,
    { data: auth, headers: { origin: baseURL } }
  )
  assert.ok(signin.ok(), `signin ${signin.status()}`)
  page = await context.newPage()
  const screenshot = async (name, title) => {
    await expect(
      page.getByRole('dialog', { name: title, exact: true })
    ).toBeInViewport({ ratio: 0.95 })
    // Wait for the existing drawer/sheet CSS transitions before recording evidence.
    await page.waitForTimeout(450)
    await page.screenshot({
      path: join(artifacts, name),
      animations: 'disabled',
    })
  }
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(`${baseURL}/wishlist`)
  await expect(
    page.getByRole('heading', { name: /Sua lista de desejos/ })
  ).toBeVisible()
  const count = async () =>
    Number(
      (await pool.query('SELECT count(*) FROM wishlist_items')).rows[0].count
    )
  const open = async () => {
    await page.getByRole('button', { name: 'Novo item', exact: true }).click()
    await expect(
      page.getByRole('heading', { name: 'Adicionar um presente' })
    ).toBeVisible()
  }
  const draft = {
    name: 'Caneca importada',
    description: 'Cerâmica azul',
    price: 12345,
    image: null,
    link: 'https://example.com/cup',
    message: 'Confira as informações antes de salvar.',
  }

  // Deterministic provider response; real browser, form, save action, auth and DB.
  await page.route('**/api/products/preview', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 700))
    await route.fulfill({ json: draft })
  })
  await open()
  await page.getByLabel('Link do produto', { exact: true }).fill(draft.link)
  await page
    .getByRole('button', { name: 'Buscar produto', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Buscando informações…' })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Novo item', exact: true })
  ).toBeVisible()
  await expect(page.locator('input[name="name"]')).toHaveValue(draft.name)
  await expect(page.locator('textarea[name="description"]')).toHaveValue(
    draft.description
  )
  await expect(
    page.locator('[role="dialog"] input[inputmode="decimal"]')
  ).toHaveValue('R$ 123,45')
  assert.equal(await count(), 0)
  await screenshot('desktop-draft.png', 'Novo item')
  passed.push('Desktop: modal, loading, prefilled panel, no record before Save')
  await page.locator('input[name="name"]').fill('Caneca revisada')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(
    page.getByText('Item criado com sucesso!', { exact: true })
  ).toBeVisible()
  assert.equal(await count(), 1)
  assert.equal(
    (await pool.query('SELECT name, price FROM wishlist_items')).rows[0].name,
    'Caneca revisada'
  )
  assert.equal(
    (await pool.query('SELECT name, price FROM wishlist_items')).rows[0].price,
    12345
  )
  passed.push(
    'Save: revised fields persisted once through the real server action'
  )

  await open()
  await page.getByRole('button', { name: 'Preencher manualmente' }).click()
  await expect(page.locator('input[name="name"]')).toHaveValue('')
  await page.keyboard.press('Escape')
  assert.equal(await count(), 1)
  passed.push('Manual entry starts empty; cancel does not save')

  await page.unroute('**/api/products/preview')
  await page.route('**/api/products/preview', (route) =>
    route.fulfill({
      status: 429,
      json: { error: 'Aguarde um minuto antes de tentar novamente.' },
    })
  )
  await open()
  await page.getByLabel('Link do produto', { exact: true }).fill(draft.link)
  await page
    .getByRole('button', { name: 'Buscar produto', exact: true })
    .click()
  await expect(page.getByRole('alert')).toContainText('Aguarde um minuto')
  await page.keyboard.press('Escape')
  passed.push('API errors remain in modal with manual-entry option')

  await page.unroute('**/api/products/preview')
  let release
  const waiting = new Promise((resolve) => {
    release = resolve
  })
  await page.route('**/api/products/preview', async (route) => {
    await waiting
    await route.fulfill({ json: draft }).catch(() => {})
  })
  await open()
  await page.getByLabel('Link do produto', { exact: true }).fill(draft.link)
  await page
    .getByRole('button', { name: 'Buscar produto', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Buscando informações…' })
  ).toBeVisible()
  await page.keyboard.press('Escape')
  release()
  await page.waitForTimeout(300)
  await expect(
    page.getByRole('heading', { name: 'Novo item', exact: true })
  ).toHaveCount(0)
  assert.equal(await count(), 1)
  passed.push(
    'Closing a pending request prevents late responses from opening the panel'
  )

  await page.unroute('**/api/products/preview')
  // Real API validation (no interception): rejects private targets without network access.
  const invalid = await context.request.post(
    `${baseURL}/api/products/preview`,
    { data: { url: 'http://127.0.0.1/private' }, headers: { origin: baseURL } }
  )
  assert.equal(invalid.status(), 400)
  const anonymous = await browser.newContext()
  const unauthorized = await anonymous.request.post(
    `${baseURL}/api/products/preview`,
    { data: { url: draft.link }, headers: { origin: baseURL } }
  )
  assert.equal(unauthorized.status(), 401)
  await anonymous.close()
  passed.push('Real preview API rejects anonymous and private-address requests')

  if (process.env.LIVE_PRODUCT_URL) {
    await open()
    await page
      .getByLabel('Link do produto', { exact: true })
      .fill(process.env.LIVE_PRODUCT_URL)
    const responsePromise = page.waitForResponse('**/api/products/preview', {
      timeout: 60000,
    })
    await page
      .getByRole('button', { name: 'Buscar produto', exact: true })
      .click()
    const response = await responsePromise
    assert.equal(response.status(), 200)
    const liveDraft = await response.json()
    assert.ok(liveDraft.name, 'Live store returned a product name')
    assert.ok(liveDraft.image, 'Live store returned a valid image')
    await expect(page.locator('input[name="name"]')).toHaveValue(liveDraft.name)
    await expect(
      page.getByRole('dialog').getByAltText('Imagem do produto')
    ).toHaveAttribute('src', /^blob:/)
    await screenshot('live-product-draft.png', 'Novo item')
    await page.keyboard.press('Escape')
    assert.equal(await count(), 1)
    passed.push(
      `Live store: ${liveDraft.name}; ${liveDraft.price} cents; image preview; no record on cancel`
    )
  }

  await page.setViewportSize({ width: 390, height: 844 })
  const image = (
    await sharp({
      create: { width: 100, height: 100, channels: 3, background: '#aabbcc' },
    })
      .webp()
      .toBuffer()
  ).toString('base64')
  await page.route('**/api/products/preview', (route) =>
    route.fulfill({
      json: { ...draft, image: { base64: image, type: 'image/webp' } },
    })
  )
  await open()
  await screenshot('mobile-modal.png', 'Adicionar um presente')
  await page.getByLabel('Link do produto', { exact: true }).fill(draft.link)
  await page
    .getByRole('button', { name: 'Buscar produto', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Novo item', exact: true })
  ).toBeVisible()
  await expect(page.locator('input[name="name"]')).toHaveValue(draft.name)
  await expect(
    page.getByRole('dialog').getByAltText('Imagem do produto')
  ).toHaveAttribute('src', /^blob:/)
  await screenshot('mobile-draft.png', 'Novo item')
  assert.equal(await count(), 1)
  passed.push(
    'Mobile: bottom modal transitions to editable sheet without saving'
  )
  assert.deepEqual(errors, [])
  writeFileSync(
    join(artifacts, 'results.json'),
    JSON.stringify({ passed, errors }, null, 2)
  )
  console.log(JSON.stringify({ passed, errors }, null, 2))
} catch (error) {
  if (page)
    await page
      .screenshot({ path: join(artifacts, 'failure.png') })
      .catch(() => {})
  writeFileSync(
    join(artifacts, 'results.json'),
    JSON.stringify({ passed, errors, failure: String(error) }, null, 2)
  )
  console.error(error)
  process.exitCode = 1
} finally {
  await browser?.close()
  await pool?.end()
  if (server && server.exitCode === null) {
    server.kill('SIGTERM')
    await new Promise((resolve) => server.once('exit', resolve))
  }
  if (started) {
    const stopped = spawnSync(
      join(bin, 'pg_ctl'),
      ['-D', data, '-m', 'immediate', '-w', 'stop'],
      { encoding: 'utf8' }
    )
    if (stopped.status === 0)
      rmSync(directory, { recursive: true, force: true })
    else console.error(`Retained temporary database directory: ${directory}`)
  } else rmSync(directory, { recursive: true, force: true })
}
