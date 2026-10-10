import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import { loadModule } from '../helpers/load-module.mjs'

const jsxRuntime = {
  jsx: (type, props) => ({ type, props }),
  jsxs: (type, props) => ({ type, props }),
  Fragment: 'fragment',
}

function findElement(node, type) {
  if (!node) return null
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findElement(child, type)
      if (match) return match
    }
    return null
  }
  if (node.type === type) return node
  return findElement(node.props?.children, type)
}

function fixture(actor = null) {
  const items = [
    {
      id: 'visible',
      userId: 'owner',
      name: 'Public gift',
      isActive: true,
      price: 100,
      isPurchased: false,
    },
    {
      id: 'hidden',
      userId: 'owner',
      name: 'Private gift',
      isActive: false,
      price: 50,
      description: 'Private notes',
      isPurchased: false,
    },
    {
      id: 'other',
      userId: 'other',
      name: 'Other gift',
      isActive: true,
      price: 25,
      isPurchased: false,
    },
  ]
  const profile = {
    id: 'owner',
    name: 'Owner Name',
    image: null,
    email: 'private@example.test',
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const requireAuthenticatedUserId = mock.fn(async () => {
    if (!actor) throw new Error('Authentication required')
    return actor
  })
  const wishlistItem = {
    findMany: mock.fn(async ({ where }) =>
      items.filter(
        (item) =>
          item.userId === where.userId &&
          (where.isActive === undefined || item.isActive === where.isActive) &&
          (where.price === undefined || item.price <= where.price.lte)
      )
    ),
    update: mock.fn(async ({ where, data }) => {
      const item = items.find(
        (item) =>
          item.id === where.id &&
          (where.isActive === undefined || item.isActive === where.isActive)
      )
      if (!item) throw new Error('Not found')
      Object.assign(item, data)
      return item
    }),
  }
  const user = {
    findUnique: mock.fn(async ({ where, select }) => {
      if (where.id !== profile.id) return null
      return select
        ? Object.fromEntries(
            Object.keys(select).map((key) => [key, profile[key]])
          )
        : profile
    }),
  }
  const prisma = { wishlistItem, user }
  const actions = loadModule('src/server/wishlistItem.ts', {
    '@/lib/prisma': { prisma },
    './session': { requireAuthenticatedUserId },
    '@/lib/utils': { sanitizeLinkUrl: (value) => value },
    './s3': {},
    '@/lib/s3': {},
    '@aws-sdk/client-s3': {},
  })
  const profiles = loadModule('src/lib/repositories/UserRepository.ts', {
    '@/lib/prisma': { prisma },
  })
  return {
    actions,
    profiles,
    wishlistItem,
    user,
    items,
    requireAuthenticatedUserId,
  }
}

test('anonymous public query returns only active items for the requested owner', async () => {
  const f = fixture()
  const result = await f.actions.listPublicWishlistItems('owner')
  assert.deepEqual(
    result.map((item) => item.id),
    ['visible']
  )
  assert.equal(
    f.wishlistItem.findMany.mock.calls[0].arguments[0].where.isActive,
    true
  )
  assert.equal(f.requireAuthenticatedUserId.mock.callCount(), 0)
})

test('public filters cannot override the visibility boundary', async () => {
  const f = fixture()
  const result = await f.actions.listPublicWishlistItems('owner', {
    maxPrice: 75,
    isActive: false,
    userId: 'other',
  })
  assert.equal(result.length, 0)
  const { where } = f.wishlistItem.findMany.mock.calls[0].arguments[0]
  assert.equal(where.userId, 'owner')
  assert.equal(where.isActive, true)
  assert.equal(where.price.lte, 75)
})

test('owner read includes own hidden items and ignores forged identity filters', async () => {
  const f = fixture('owner')
  const result = await f.actions.listWishlistItems({ userId: 'other' })
  assert.deepEqual(
    result.map((item) => item.id),
    ['visible', 'hidden']
  )
  assert.equal(
    f.wishlistItem.findMany.mock.calls[0].arguments[0].where.userId,
    'owner'
  )
})

test('owner price filters still apply', async () => {
  const f = fixture('owner')
  const result = await f.actions.listWishlistItems({ maxPrice: 75 })
  assert.deepEqual(
    result.map((item) => item.id),
    ['hidden']
  )
})

test('anonymous owner read cannot bypass authentication using the old user ID argument', async () => {
  const f = fixture()
  await assert.rejects(
    f.actions.listWishlistItems('owner'),
    /Authentication required/
  )
  assert.equal(f.wishlistItem.findMany.mock.callCount(), 0)
})

test('public profile exposes only ID, name, and image', async () => {
  const f = fixture()
  const profile = await f.profiles.getPublicUserProfile('owner')
  assert.deepEqual(Object.keys(profile).sort(), ['id', 'image', 'name'])
  assert.equal(profile.email, undefined)
  assert.equal(profile.emailVerified, undefined)
  assert.equal(profile.createdAt, undefined)
  assert.equal(profile.updatedAt, undefined)
  assert.equal(f.profiles.getUserByEmail, undefined)
  assert.equal(f.profiles.getUserById, undefined)
})

test('missing public profile returns null', async () => {
  assert.equal(await fixture().profiles.getPublicUserProfile('missing'), null)
})

for (const value of ['', '   ', null, undefined, { not: null }]) {
  test(`invalid public user ID ${JSON.stringify(value)} is rejected before querying`, async () => {
    const f = fixture()
    await assert.rejects(
      f.actions.listPublicWishlistItems(value),
      /User ID is required/
    )
    await assert.rejects(
      f.profiles.getPublicUserProfile(value),
      /User ID is required/
    )
    assert.equal(f.wishlistItem.findMany.mock.callCount(), 0)
    assert.equal(f.user.findUnique.mock.callCount(), 0)
  })
}

test('purchase action cannot mutate or return a hidden item by its known ID', async () => {
  const f = fixture()
  assert.equal(
    await f.actions.purchaseWishlistItem({ id: 'hidden', isPurchased: false }),
    undefined
  )
  assert.equal(f.items.find((item) => item.id === 'hidden').isPurchased, false)
  assert.equal(
    f.wishlistItem.update.mock.calls[0].arguments[0].where.isActive,
    true
  )
})

test('anonymous purchase marking still works for active items', async () => {
  const result = await fixture().actions.purchaseWishlistItem({
    id: 'visible',
    isPurchased: false,
  })
  assert.equal(result.isPurchased, true)
})

test('shared page passes only public items into client component props', async () => {
  const f = fixture()
  const page = loadModule(
    'src/app/(public)/wishlist/shared/[userId]/page.tsx',
    {
      '@/server/wishlistItem': f.actions,
      '@/lib/repositories/UserRepository': f.profiles,
      '@/server/session': { getSessionOnServer: async () => null },
      '@/lib/utils': {
        getDisplayName: (name) => name,
        setAvatarFallbackString: () => 'ON',
      },
      './ui/Wishlist-shared': { WishlistShared: 'wishlist-shared' },
      './ui/Wishlist-shared-owner-warning': {
        WishlistSharedOwnerWarning: 'owner-warning',
      },
      '@/components/ui/avatar': {
        Avatar: 'avatar',
        AvatarImage: 'avatar-image',
        AvatarFallback: 'avatar-fallback',
      },
      react: { Suspense: 'suspense' },
      'react/jsx-runtime': jsxRuntime,
    }
  )
  const tree = await page.default({
    params: Promise.resolve({ userId: 'owner' }),
  })
  const props = findElement(tree, 'wishlist-shared').props
  assert.deepEqual(
    props.initialWishlist.map((item) => item.id),
    ['visible']
  )
  const serialized = JSON.stringify(tree)
  for (const privateValue of [
    'Private gift',
    'Private notes',
    'private@example.test',
    'emailVerified',
  ]) {
    assert.equal(serialized.includes(privateValue), false)
  }
})

test('recovery submits both known and unknown emails without a lookup and acknowledges both identically', async () => {
  let submit
  const requestPasswordReset = mock.fn(async () => ({
    data: { status: true },
    error: null,
  }))
  const success = mock.fn()
  const { AuthForgotPasswordForm } = loadModule(
    'src/app/(public)/login/ui/Auth-forgot-password-form.tsx',
    {
      '@/lib/auth-client': { authClient: { requestPasswordReset } },
      '@/schemas/auth': { forgotPasswordFormSchema: {} },
      '@hookform/resolvers/zod': { zodResolver: () => ({}) },
      'react-hook-form': {
        useForm: () => ({
          register: () => ({}),
          clearErrors() {},
          handleSubmit: (callback) => {
            submit = callback
            return callback
          },
          formState: { errors: {}, isSubmitting: false },
        }),
      },
      sonner: { toast: { success } },
      '@/components/ui/button': { Button: 'button' },
      '@/components/ui/form/form-error': { FormError: 'form-error' },
      '@/components/ui/form/form-input-wrapper': {
        InputWrapper: 'input-wrapper',
      },
      '@/components/ui/input': { Input: 'input' },
      '@/components/ui/label': { Label: 'label' },
      'lucide-react': { LoaderCircle: 'loader' },
      'react/jsx-runtime': jsxRuntime,
    }
  )
  AuthForgotPasswordForm({ setFormType() {} })
  await submit({ email: 'known@example.test' })
  await submit({ email: 'unknown@example.test' })
  assert.equal(requestPasswordReset.mock.callCount(), 2)
  assert.equal(
    requestPasswordReset.mock.calls[0].arguments[0].email,
    'known@example.test'
  )
  assert.equal(
    requestPasswordReset.mock.calls[1].arguments[0].email,
    'unknown@example.test'
  )
  assert.equal(
    requestPasswordReset.mock.calls[0].arguments[0].redirectTo,
    '/reset-password'
  )
  assert.equal(
    success.mock.calls[0].arguments[0],
    'Se known@example.test estiver cadastrado, você receberá um link de recuperação'
  )
  assert.equal(
    success.mock.calls[1].arguments[0],
    'Se unknown@example.test estiver cadastrado, você receberá um link de recuperação'
  )
})
