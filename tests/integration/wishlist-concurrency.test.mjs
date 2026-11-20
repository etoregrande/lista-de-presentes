import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import * as crypto from 'node:crypto'
import { PrismaPg } from '@prisma/adapter-pg'
import prismaExports from '../../src/generated/prisma/index.js'
import { loadModule } from '../helpers/load-module.mjs'
import { validationModules } from '../helpers/validation-modules.mjs'

const url = process.env.TEST_DATABASE_URL
assert.ok(url, 'Run through npm run test:integration')
assert.equal(new URL(url).pathname, '/presenteio_test')
assert.match(new URL(url).searchParams.get('host') ?? '', /presenteio-pg-test-/)
const prisma = new prismaExports.PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
})
after(() => prisma.$disconnect())

async function createItem() {
  const id = crypto.randomUUID()
  await prisma.user.create({
    data: { id, name: 'Owner', email: `${id}@example.test`, emailVerified: true },
  })
  return prisma.wishlistItem.create({ data: { name: 'Gift', userId: id } })
}

function actions(actor, deleted = [], upload) {
  const browserCookies = new Map()
  const action = loadModule('src/server/wishlistItem.ts', {
    ...validationModules,
    '@/lib/prisma': { prisma },
    './session': {
      requireAuthenticatedUserId: async () => actor,
      getSessionOnServer: async () => actor ? { user: { id: actor } } : null,
    },
    './s3': {
      uploadImageToS3: upload ?? (async () => { throw new Error('Unexpected upload') }),
      deleteImageFromS3: async (url) => { deleted.push(url) },
    },
    'next/headers': {
      cookies: async () => ({
        get: (name) => browserCookies.has(name) ? { value: browserCookies.get(name) } : undefined,
        set: (name, value) => browserCookies.set(name, value),
      }),
    },
    'node:crypto': crypto,
  })
  return { action, browserCookies }
}

test('only one buyer claims an item and only that browser can undo', async () => {
  const item = await createItem()
  const first = actions(null)
  const second = actions(null)
  const results = await Promise.all([
    first.action.purchaseWishlistItem({ id: item.id, isPurchased: false }),
    second.action.purchaseWishlistItem({ id: item.id, isPurchased: false }),
  ])
  assert.equal(results.filter(Boolean).length, 1)
  assert.equal(results.find(Boolean).purchaseClaimHash, undefined)
  const winner = results[0] ? first : second
  const loser = results[0] ? second : first
  assert.equal(await loser.action.purchaseWishlistItem({ id: item.id, isPurchased: true }), undefined)
  assert.equal((await prisma.wishlistItem.findUnique({ where: { id: item.id } })).isPurchased, true)
  assert.equal((await winner.action.purchaseWishlistItem({ id: item.id, isPurchased: true })).isPurchased, false)
})

test('stale image update removes its upload without replacing the winning image', async () => {
  const item = await createItem()
  const deleted = []
  let waiting = 0
  let release
  const gate = new Promise((resolve) => { release = resolve })
  const upload = async () => {
    const number = ++waiting
    if (waiting === 2) release()
    await gate
    return `https://bucket.test/upload-${number}`
  }
  const owner = actions(item.userId, deleted, upload)
  const form = {
    name: 'Gift', description: null, link: null, price: 100,
    isActive: true, image: new File(['image'], 'gift.png', { type: 'image/png' }),
  }
  const results = await Promise.all([
    owner.action.updateWishlistItem(form, item.id),
    owner.action.updateWishlistItem(form, item.id),
  ])
  assert.equal(results.filter(Boolean).length, 1)
  const savedImage = (await prisma.wishlistItem.findUnique({ where: { id: item.id } })).image
  assert.equal(savedImage, results.find(Boolean).image)
  assert.equal(deleted.length, 1)
  assert.notEqual(deleted[0], savedImage)
})
