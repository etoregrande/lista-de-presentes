import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import sharp from 'sharp'
import { loadModule } from '../helpers/load-module.mjs'
import {
  validationModules,
  imageSchemas,
  wishlistSchemas,
  groupSchemas,
} from '../helpers/validation-modules.mjs'

function fixture() {
  const send = mock.fn(async () => ({}))
  const create = mock.fn(async ({ data }) => ({ id: 'item', ...data }))
  const update = mock.fn(async ({ data }) => ({ id: 'item', ...data }))
  const deleteItem = mock.fn(async () => ({}))
  const groupCreate = mock.fn(async ({ data }) => ({ id: 'group', ...data }))
  const groupUpdate = mock.fn(async ({ data }) => ({ id: 'group', ...data }))
  const membershipCreate = mock.fn(async () => ({}))
  const userUpdate = mock.fn(async ({ data }) => ({ id: 'owner', ...data }))
  const findItem = mock.fn(async () => ({
    image: 'https://bucket.test/old-image',
  }))
  const findItems = mock.fn(async () => [])
  const validatedImages = loadModule('src/lib/validated-image.ts', {
    sharp,
    '@/schemas/image': imageSchemas,
  })
  class StorageCommand {
    constructor(input) {
      this.input = input
    }
  }
  const s3Actions = loadModule('src/server/s3.ts', {
    '@/lib/s3': { s3: { send } },
    '@aws-sdk/client-s3': {
      PutObjectCommand: StorageCommand,
      DeleteObjectCommand: StorageCommand,
    },
    '@/lib/validated-image': validatedImages,
  })
  const dependencies = {
    ...validationModules,
    './session': { requireAuthenticatedUserId: async () => 'owner' },
    '@/lib/prisma': {
      prisma: {
        wishlistItem: {
          create,
          update,
          delete: deleteItem,
          findUnique: findItem,
          findMany: findItems,
        },
        user: { update: userUpdate },
        secretSantaGroup: {
          create: groupCreate,
          update: groupUpdate,
          findUnique: async () => ({ id: 'group', ownerId: 'owner' }),
        },
        userSecretSantaGroup: { create: membershipCreate },
      },
    },
    './s3': s3Actions,
    '@/lib/s3': { s3: { send } },
    '@aws-sdk/client-s3': { DeleteObjectCommand: StorageCommand },
    '@/lib/utils': { generateSecretSantaGroupSlug: () => 'group-invite' },
    '@/lib/error': { isPrismaP2002: () => false },
  }
  const wishlist = loadModule('src/server/wishlistItem.ts', dependencies)
  const groups = loadModule('src/server/secretSantaGroup.ts', dependencies)
  const avatar = loadModule('src/server/user.ts', dependencies)
  const writes = [
    send,
    create,
    update,
    deleteItem,
    groupCreate,
    groupUpdate,
    membershipCreate,
    userUpdate,
  ]
  return {
    wishlist,
    groups,
    avatar,
    send,
    create,
    update,
    groupCreate,
    groupUpdate,
    writes,
    findItems,
  }
}

function noWrites(f) {
  for (const fn of f.writes) assert.equal(fn.mock.callCount(), 0)
}
const form = {
  name: 'Gift',
  description: null,
  link: null,
  image: null,
  price: 100,
  priority: 'normal',
  isActive: true,
}
const groupForm = { name: 'Holiday', priceLimit: 100, eventDate: null }

const invalidItemFields = [
  { name: '   ' },
  { name: 'x'.repeat(256) },
  ...[-1, 1.5, 2_147_483_648, Infinity, NaN, '100'].map((price) => ({ price })),
  { priority: 'invalid' },
  { isActive: 'true' },
  { description: {} },
  ...[
    'javascript:alert(1)',
    'data:text/html,test',
    'ftp://example.com',
    'http://127.0.0.1',
    'http://[::1]',
    'http://localhost',
    'http://host.local.',
    'https://user:pass@example.com',
  ].map((link) => ({ link })),
  { image: 'https://example.com/file.png' },
  { image: { size: 1, type: 'image/png' } },
]

for (const [index, fields] of invalidItemFields.entries()) {
  test(`invalid wishlist fields ${index} cannot create or edit an item`, async () => {
    const f = fixture()
    await assert.rejects(f.wishlist.createWishlistItem({ ...form, ...fields }))
    await assert.rejects(
      f.wishlist.updateWishlistItem({ ...form, ...fields }, 'item')
    )
    noWrites(f)
  })
}

for (const [index, fields] of [
  { name: ' ' },
  { name: 'ab' },
  { name: 'x'.repeat(256) },
  ...[-1, 1.5, 2_147_483_648, Infinity, NaN, '100'].map((priceLimit) => ({
    priceLimit,
  })),
  { eventDate: '2026-12-01' },
  { eventDate: new Date('invalid') },
].entries()) {
  test(`invalid group fields ${index} cannot create or edit a group`, async () => {
    const f = fixture()
    await assert.rejects(
      f.groups.createSecretSantaGroup({ ...groupForm, ...fields })
    )
    await assert.rejects(
      f.groups.updateSecretSantaGroup('group', { ...groupForm, ...fields })
    )
    noWrites(f)
  })
}

test('valid prices at PostgreSQL limits and null values are accepted', () => {
  for (const price of [null, undefined, 0, 2_147_483_647]) {
    assert.equal(
      wishlistSchemas.wishlistItemFormSchema.safeParse({ ...form, price })
        .success,
      true
    )
    assert.equal(
      groupSchemas.secretSantaGroupFormSchema.safeParse({
        ...groupForm,
        priceLimit: price,
      }).success,
      true
    )
  }
})

test('validated names and URLs are normalized and unknown fields are discarded before writing', async () => {
  const f = fixture()
  const result = await f.wishlist.createWishlistItem({
    ...form,
    name: '  gIFT  ',
    link: ' example.com/gift ',
    userId: 'other',
    isPurchased: true,
  })
  assert.equal(result.name, 'Gift')
  assert.equal(result.link, 'https://example.com/gift')
  assert.equal(result.userId, 'owner')
  assert.equal(result.isPurchased, undefined)
})

test('valid date objects are accepted without changing the event date', async () => {
  const f = fixture()
  const date = new Date('2026-12-01T12:00:00Z')
  const result = await f.groups.updateSecretSantaGroup('group', {
    ...groupForm,
    eventDate: date,
  })
  assert.equal(result.success, true)
  assert.equal(result.group.eventDate.getTime(), date.getTime())
})

for (const value of ['', '  ', null, { not: null }]) {
  test(`invalid item identifier ${JSON.stringify(value)} cannot delete an item`, async () => {
    const f = fixture()
    await assert.rejects(f.wishlist.deleteWishlistItem(value))
    noWrites(f)
  })
}

for (const isPurchased of ['false', 0, null, undefined]) {
  test(`invalid purchase state ${JSON.stringify(isPurchased)} cannot mutate an item`, async () => {
    const f = fixture()
    await assert.rejects(
      f.wishlist.purchaseWishlistItem({ id: 'item', isPurchased })
    )
    noWrites(f)
  })
}

test('invalid price filters never reach the database', async () => {
  const f = fixture()
  for (const maxPrice of [-1, 1.5, 2_147_483_648, Infinity, NaN]) {
    await assert.rejects(
      f.wishlist.listPublicWishlistItems('owner', { maxPrice })
    )
  }
  assert.equal(f.findItems.mock.callCount(), 0)
})

async function encodedImage(format, options = {}) {
  const buffer = await sharp({
    create: {
      width: options.width ?? 2,
      height: options.height ?? 2,
      channels: 3,
      background: '#aabbcc',
    },
  })
    .toFormat(format)
    .toBuffer()
  const mime = format === 'jpeg' ? 'image/jpeg' : `image/${format}`
  return new File([buffer], `image.${format}`, { type: options.mime ?? mime })
}

for (const format of ['jpeg', 'png', 'webp']) {
  test(`real ${format} images are decoded and uploaded with the correct MIME type`, async () => {
    const f = fixture()
    const file = await encodedImage(format)
    await f.wishlist.createWishlistItem({ ...form, image: file })
    assert.equal(f.send.mock.callCount(), 1)
    assert.equal(f.create.mock.callCount(), 1)
    const { Body, ContentType } = f.send.mock.calls[0].arguments[0].input
    assert.equal(ContentType, file.type)
    assert.equal((await sharp(Body).metadata()).format, format)
  })
}

const invalidFiles = [
  [
    'HTML declared as PNG',
    () =>
      new File(['<html><script>alert(1)</script></html>'], 'image.png', {
        type: 'image/png',
      }),
  ],
  [
    'SVG declared as PNG',
    () =>
      new File(['<svg xmlns="http://www.w3.org/2000/svg"/>'], 'image.png', {
        type: 'image/png',
      }),
  ],
  [
    'PNG signature without valid pixels',
    () =>
      new File(
        [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
        'image.png',
        { type: 'image/png' }
      ),
  ],
  [
    'truncated JPEG',
    async () => {
      const file = await encodedImage('jpeg')
      return new File(
        [Buffer.from(await file.arrayBuffer()).subarray(0, 150)],
        'image.jpg',
        { type: 'image/jpeg' }
      )
    },
  ],
  ['mismatched MIME type', () => encodedImage('png', { mime: 'image/jpeg' })],
  ['empty file', () => new File([], 'image.png', { type: 'image/png' })],
  [
    'unsupported MIME type',
    () => new File(['data'], 'image.svg', { type: 'image/svg+xml' }),
  ],
  [
    'file larger than 5 MiB',
    () =>
      new File([Buffer.alloc(imageSchemas.MAX_IMAGE_BYTES + 1)], 'image.png', {
        type: 'image/png',
      }),
  ],
  [
    'image exceeds 16 megapixels',
    () => encodedImage('png', { width: 4001, height: 4000 }),
  ],
]

for (const [name, makeFile] of invalidFiles) {
  test(`${name} cannot create, replace, or upload an avatar`, async () => {
    const file = await makeFile()
    const f = fixture()
    await assert.rejects(
      f.wishlist.createWishlistItem({ ...form, image: file })
    )
    await assert.rejects(
      f.wishlist.updateWishlistItem({ ...form, image: file }, 'item')
    )
    await assert.rejects(f.avatar.updateUserAvatar({ image: file }))
    noWrites(f)
  })
}

test('valid avatar and wishlist replacements preserve authorized write paths', async () => {
  const file = await encodedImage('png')
  const f = fixture()
  await f.avatar.updateUserAvatar({ image: file })
  await f.wishlist.updateWishlistItem({ ...form, image: file }, 'item')
  assert.equal(f.send.mock.callCount(), 3) // Two uploads plus the old wishlist image deletion.
  assert.equal(f.update.mock.callCount(), 1)
})

test('avatar rejects nulls, URLs, and file-shaped objects before writing', async () => {
  const f = fixture()
  for (const image of [
    null,
    undefined,
    'https://example.com/avatar.png',
    { size: 10, type: 'image/png' },
  ]) {
    await assert.rejects(f.avatar.updateUserAvatar({ image }))
  }
  noWrites(f)
})

test('re-encoding removes trailing non-image payloads before upload', async () => {
  const file = await encodedImage('png')
  const marker = '<script>non-image-payload</script>'
  const upload = new File([await file.arrayBuffer(), marker], 'image.png', {
    type: 'image/png',
  })
  const f = fixture()
  await f.wishlist.createWishlistItem({ ...form, image: upload })
  const body = f.send.mock.calls[0].arguments[0].input.Body
  assert.equal(body.includes(Buffer.from(marker)), false)
  assert.equal((await sharp(body).metadata()).format, 'png')
})

test('animated WebP retains its frames during content validation', async () => {
  const buffer = await sharp(
    Buffer.concat([Buffer.alloc(12, 0), Buffer.alloc(12, 255)]),
    {
      raw: { width: 2, height: 4, channels: 3, pageHeight: 2 },
    }
  )
    .webp({ loop: 0, delay: [100, 100] })
    .toBuffer()
  const file = new File([buffer], 'animated.webp', { type: 'image/webp' })
  const f = fixture()
  await f.wishlist.createWishlistItem({ ...form, image: file })
  const body = f.send.mock.calls[0].arguments[0].input.Body
  const metadata = await sharp(body, { animated: true }).metadata()
  assert.equal(metadata.pages, 2)
  assert.equal(metadata.pageHeight, 2)
})

test('JPEG orientation is applied and EXIF metadata is removed', async () => {
  const buffer = await sharp({
    create: { width: 2, height: 3, channels: 3, background: 'white' },
  })
    .jpeg()
    .withMetadata({ orientation: 6 })
    .toBuffer()
  const f = fixture()
  await f.wishlist.createWishlistItem({
    ...form,
    image: new File([buffer], 'photo.jpg', { type: 'image/jpeg' }),
  })
  const body = f.send.mock.calls[0].arguments[0].input.Body
  const metadata = await sharp(body).metadata()
  assert.equal(metadata.width, 3)
  assert.equal(metadata.height, 2)
  assert.equal(metadata.exif, undefined)
  assert.equal(metadata.orientation, undefined)
})
