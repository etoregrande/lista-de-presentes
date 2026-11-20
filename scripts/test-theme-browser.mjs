// Run with the local app running; no accounts or database writes are needed.
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium, expect } from '@playwright/test'

const baseURL = process.env.THEME_TEST_URL ?? 'http://127.0.0.1:3108'
const artifacts = 'outputs/reports/theme'
mkdirSync(artifacts, { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ colorScheme: 'dark' })
const page = await context.newPage()
const errors = []
const passed = []
page.on('pageerror', (error) => errors.push(error.message))
const check = async (theme) => {
  await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`))
  assert.equal(
    await page.locator('html').evaluate((el) => el.style.colorScheme),
    theme
  )
}
const select = async (name) => {
  await page.getByRole('button', { name: /^Tema:/ }).click()
  await page.getByRole('menuitemradio', { name, exact: true }).click()
}
try {
  await page.goto(baseURL)
  await expect(
    page.getByRole('button', { name: 'Tema: Preferência do navegador' })
  ).toBeVisible()
  await check('dark')
  await page.emulateMedia({ colorScheme: 'light' })
  await check('light')
  passed.push('Default follows browser and responds to live changes')
  await select('Escuro')
  await check('dark')
  await page.reload()
  await check('dark')
  await expect(page.getByRole('button', { name: 'Tema: Escuro' })).toBeVisible()
  passed.push('Manual dark overrides browser and survives reload')
  const other = await context.newPage()
  await other.goto(baseURL)
  await select('Claro')
  await expect(other.locator('html')).toHaveClass(/light/)
  await other.close()
  await page.emulateMedia({ colorScheme: 'dark' })
  await check('light')
  passed.push('Manual light overrides browser and synchronizes tabs')
  await select('Preferência do navegador')
  await check('dark')
  await page.emulateMedia({ colorScheme: 'light' })
  await check('light')
  passed.push('Returning to browser preference resumes automatic updates')
  for (const path of ['/login', '/reset-password']) {
    await page.goto(`${baseURL}${path}`)
    await expect(page.getByRole('button', { name: /^Tema:/ })).toBeVisible()
    for (const [label, theme] of [
      ['Escuro', 'dark'],
      ['Claro', 'light'],
    ]) {
      await select(label)
      await check(theme)
      await page.screenshot({
        path: `${artifacts}/${path.slice(1)}-${theme}.png`,
      })
    }
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${baseURL}/login`)
  await select('Escuro')
  await check('dark')
  await page.screenshot({ path: `${artifacts}/mobile-dark.png` })
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    ),
    'No mobile horizontal overflow'
  )
  // Keyboard access to menu and selected mode.
  await page.getByRole('button', { name: /^Tema:/ }).focus()
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('menuitemradio', { name: 'Escuro', exact: true })
  ).toHaveAttribute('aria-checked', 'true')
  await page.keyboard.press('Escape')
  passed.push(
    'Login and password reset in both themes; mobile menu and keyboard access'
  )
  assert.deepEqual(errors, [])
} catch (error) {
  await page.screenshot({ path: `${artifacts}/failure.png` }).catch(() => {})
  errors.push(String(error))
  process.exitCode = 1
} finally {
  writeFileSync(
    `${artifacts}/results.json`,
    JSON.stringify({ baseURL, passed, errors }, null, 2)
  )
  console.log(JSON.stringify({ passed, errors }, null, 2))
  await browser.close()
}
