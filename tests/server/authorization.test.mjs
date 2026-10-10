import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import { loadModule } from '../helpers/load-module.mjs'

function fixture(userId = 'owner') {
  const getSession = mock.fn(async () =>
    userId ? { user: { id: userId } } : null
  )
  const session = loadModule('src/server/session.ts', {
    '@/lib/auth': { auth: { api: { getSession } } },
    'next/headers': { headers: async () => new Headers() },
  })
  const records = new Map([
    [
      'own-item',
      {
        id: 'own-item',
        userId: 'owner',
        isActive: true,
        image: 'https://bucket.test/old-image',
      },
    ],
    [
      'other-item',
      {
        id: 'other-item',
        userId: 'other',
        isActive: true,
        image: 'https://bucket.test/other-image',
      },
    ],
  ])
  const wishlistItem = {
    create: mock.fn(async ({ data }) => ({ id: 'new-item', ...data })),
    findUnique: mock.fn(async ({ where }) => {
      const item = records.get(where.id)
      return item?.userId === where.userId ? item : null
    }),
    update: mock.fn(async ({ where, data }) => {
      const item = records.get(where.id)
      if (
        !item ||
        (where.userId !== undefined && item.userId !== where.userId) ||
        (where.isActive !== undefined && item.isActive !== where.isActive)
      )
        throw new Error('Not found')
      return { ...item, ...data }
    }),
    delete: mock.fn(async ({ where }) => {
      const item = records.get(where.id)
      if (!item || item.userId !== where.userId) throw new Error('Not found')
      records.delete(where.id)
      return { image: item.image }
    }),
  }
  const user = {
    update: mock.fn(async ({ where, data }) => ({ id: where.id, ...data })),
  }
  const uploadImageToS3 = mock.fn(async () => 'https://bucket.test/new-image')
  const deleteImageFromS3 = mock.fn(async () => {})
  const send = mock.fn(async () => {})
  const dependencies = {
    '@/lib/prisma': { prisma: { wishlistItem, user } },
    '@/lib/auth': { auth: { api: { getSession } } },
    'next/headers': { headers: async () => new Headers() },
    '@/lib/utils': { sanitizeLinkUrl: (value) => value },
    '@/lib/s3': { s3: { send } },
    '@aws-sdk/client-s3': {
      DeleteObjectCommand: class {
        constructor(input) {
          this.input = input
        }
      },
    },
    './s3': { uploadImageToS3, deleteImageFromS3 },
    './session': session,
  }
  const actions = loadModule('src/server/wishlistItem.ts', dependencies)
  const avatar = loadModule('src/server/user.ts', dependencies)
  return {
    session,
    actions,
    avatar,
    wishlistItem,
    user,
    uploadImageToS3,
    deleteImageFromS3,
    send,
    records,
  }
}

const form = {
  name: 'Gift',
  link: null,
  image: null,
  price: 100,
  isActive: true,
}

function assertNoWrites(f) {
  for (const fn of [
    f.wishlistItem.create,
    f.wishlistItem.update,
    f.wishlistItem.delete,
    f.user.update,
    f.uploadImageToS3,
    f.deleteImageFromS3,
    f.send,
  ]) {
    assert.equal(fn.mock.callCount(), 0)
  }
}

test('session helper rejects anonymous requests', async () => {
  await assert.rejects(
    fixture(null).session.requireAuthenticatedUserId(),
    /Authentication required/
  )
})

test('session helper returns the authenticated user', async () => {
  assert.equal(await fixture().session.requireAuthenticatedUserId(), 'owner')
})

for (const [name, invoke] of [
  ['create', (f) => f.actions.createWishlistItem({ ...form, image: {} })],
  [
    'edit',
    (f) => f.actions.updateWishlistItem({ ...form, image: {} }, 'own-item'),
  ],
  ['delete', (f) => f.actions.deleteWishlistItem('own-item')],
  ['avatar', (f) => f.avatar.updateUserAvatar({ image: {} })],
]) {
  test(`anonymous ${name} fails before storage or database writes`, async () => {
    const f = fixture(null)
    await assert.rejects(invoke(f), /Authentication required/)
    assertNoWrites(f)
  })
}

test('creation ignores forged user IDs and uses the session for database and storage', async () => {
  const f = fixture()
  const item = await f.actions.createWishlistItem(
    { ...form, image: {}, userId: 'other' },
    'other'
  )
  assert.equal(item.userId, 'owner')
  assert.equal(f.uploadImageToS3.mock.calls[0].arguments[2], 'owner')
})

test('cross-account edit fails before upload, deletion, or database mutation', async () => {
  const f = fixture()
  await assert.rejects(
    f.actions.updateWishlistItem({ ...form, image: {} }, 'other-item', 'other'),
    /Wishlist item not found/
  )
  assertNoWrites(f)
})

test('missing item edit fails without side effects', async () => {
  const f = fixture()
  await assert.rejects(
    f.actions.updateWishlistItem(form, 'missing'),
    /Wishlist item not found/
  )
  assertNoWrites(f)
})

test('owner edit is scoped to the session and uploads only after checking ownership', async () => {
  const f = fixture()
  f.uploadImageToS3.mock.mockImplementation(async () => {
    assert.equal(f.wishlistItem.findUnique.mock.callCount(), 1)
    return 'https://bucket.test/new-image'
  })
  const result = await f.actions.updateWishlistItem(
    { ...form, image: {} },
    'own-item',
    'other'
  )
  assert.equal(result.userId, 'owner')
  assert.equal(
    f.wishlistItem.update.mock.calls[0].arguments[0].where.userId,
    'owner'
  )
  assert.equal(f.uploadImageToS3.mock.calls[0].arguments[2], 'owner')
})

test('cross-account delete preserves the record and never deletes its image', async () => {
  const f = fixture()
  assert.equal(await f.actions.deleteWishlistItem('other-item'), null)
  assert.ok(f.records.has('other-item'))
  assert.equal(
    f.wishlistItem.delete.mock.calls[0].arguments[0].where.userId,
    'owner'
  )
  assert.equal(f.send.mock.callCount(), 0)
})

test('owner delete removes its record and image', async () => {
  const f = fixture()
  assert.equal(await f.actions.deleteWishlistItem('own-item'), undefined)
  assert.equal(f.records.has('own-item'), false)
  assert.equal(f.send.mock.callCount(), 1)
  const command = f.send.mock.calls[0].arguments[0]
  assert.equal(command.input.Bucket, 'test-bucket')
  assert.equal(command.input.Key, 'old-image')
})

test('avatar update ignores forged user IDs for storage and database writes', async () => {
  const f = fixture()
  const result = await f.avatar.updateUserAvatar(
    { image: {}, userId: 'other' },
    'other'
  )
  assert.equal(result.id, 'owner')
  assert.equal(f.uploadImageToS3.mock.calls[0].arguments[2], 'owner')
  assert.equal(f.user.update.mock.calls[0].arguments[0].where.id, 'owner')
})

test('anonymous purchase marking remains available', async () => {
  const f = fixture(null)
  const result = await f.actions.purchaseWishlistItem({
    id: 'own-item',
    isPurchased: false,
  })
  assert.equal(result.isPurchased, true)
})
