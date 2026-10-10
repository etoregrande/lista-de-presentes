import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import { loadModule } from '../helpers/load-module.mjs'
import { validationModules } from '../helpers/validation-modules.mjs'

function fixture(actor = 'owner') {
  let currentActor = actor
  const group = {
    id: 'group',
    slug: 'holiday-invite',
    ownerId: 'owner',
    name: 'Holiday',
    image: null,
    isDrawn: false,
    priceLimit: 10000,
  }
  const members = new Set(['owner', 'member', 'third', 'fourth'])
  const requireAuthenticatedUserId = mock.fn(async () => {
    if (!currentActor) throw new Error('Authentication required')
    return currentActor
  })
  const secretSantaGroup = {
    findUnique: mock.fn(async ({ where, select }) => {
      if (where.id && where.id !== group.id) return null
      if (where.slug && where.slug !== group.slug) return null
      if (where.ownerId && where.ownerId !== group.ownerId) return null
      if (
        where.OR &&
        !where.OR.some(
          (filter) =>
            filter.ownerId === group.ownerId ||
            members.has(filter.participants?.some.userId)
        )
      )
        return null
      return select
        ? Object.fromEntries(
            Object.keys(select).map((key) => [key, group[key]])
          )
        : { ...group }
    }),
    create: mock.fn(async ({ data }) => ({ id: group.id, ...data })),
    update: mock.fn(async ({ where, data }) => {
      assert.equal(where.id, group.id)
      assert.equal(where.ownerId, currentActor)
      assert.equal(currentActor, group.ownerId)
      return { ...group, ...data }
    }),
    delete: mock.fn(async ({ where }) => {
      assert.equal(where.id, group.id)
      assert.equal(where.ownerId, group.ownerId)
      assert.equal(currentActor, group.ownerId)
      return group
    }),
  }
  const userSecretSantaGroup = {
    findUnique: mock.fn(async ({ where }) => {
      const { userId, secretSantaGroupId } = where.userId_secretSantaGroupId
      return members.has(userId) && secretSantaGroupId === group.id
        ? { userId, secretSantaGroupId }
        : null
    }),
    findFirst: mock.fn(async ({ where }) =>
      members.has(where.userId) && where.secretSantaGroup.slug === group.slug
        ? { userId: where.userId }
        : null
    ),
    findMany: mock.fn(async ({ where }) =>
      members.has(where.userId) ? [{ secretSantaGroup: group }] : []
    ),
    create: mock.fn(async ({ data }) => ({ ...data, secretSantaGroup: group })),
    delete: mock.fn(async ({ where }) => {
      const { userId, secretSantaGroupId } = where.userId_secretSantaGroupId
      if (!members.has(userId) || secretSantaGroupId !== group.id)
        throw new Error('Not found')
      members.delete(userId)
      return { secretSantaGroupId }
    }),
  }
  const user = {
    findMany: mock.fn(async () => [...members].map((id) => ({ id }))),
  }
  const secretSantaDraw = { createMany: mock.fn(async () => ({ count: 4 })) }
  const transaction = mock.fn(async (queries) => Promise.all(queries))
  const actions = loadModule('src/server/secretSantaGroup.ts', {
    ...validationModules,
    './session': { requireAuthenticatedUserId },
    '@/lib/prisma': {
      prisma: {
        secretSantaGroup,
        userSecretSantaGroup,
        user,
        secretSantaDraw,
        $transaction: transaction,
      },
    },
    '@/lib/error': { isPrismaP2002: () => false },
    '@/lib/utils': {
      generateSecretSantaGroupSlug: () => group.slug,
      drawSecretSanta: (participants) =>
        participants.map((p, i) => ({
          giverId: p.id,
          receiverId: participants[(i + 1) % participants.length].id,
        })),
    },
  })
  const wrappers = loadModule('src/app/(auth)/groups/[slug]/actions.tsx', {
    '@/server/secretSantaGroup': actions,
  })
  return {
    actions,
    wrappers,
    group,
    members,
    secretSantaGroup,
    userSecretSantaGroup,
    user,
    secretSantaDraw,
    transaction,
    setActor(value) {
      currentActor = value
    },
  }
}

const form = { name: 'Holiday', priceLimit: null, eventDate: null }
const mutations = [
  ['create group', (f) => f.actions.createSecretSantaGroup(form, 'owner')],
  [
    'update group',
    (f) => f.actions.updateSecretSantaGroup('group', form, 'owner'),
  ],
  ['delete group', (f) => f.actions.deleteSecretSantaGroup('group', 'owner')],
  [
    'join group',
    (f) =>
      f.actions.createSecretSantaGroupParticipant('holiday-invite', 'owner'),
  ],
  ['leave group', (f) => f.actions.leaveSecretSantaGroup('group', 'member')],
  [
    'remove participant',
    (f) => f.actions.removeSecretSantaGroupParticipant('group', 'member'),
  ],
  ['draw', (f) => f.actions.createSecretSantaGroupDraw('group')],
]

function assertNoWrites(f) {
  for (const fn of [
    f.secretSantaGroup.create,
    f.secretSantaGroup.update,
    f.secretSantaGroup.delete,
    f.userSecretSantaGroup.create,
    f.userSecretSantaGroup.delete,
    f.secretSantaDraw.createMany,
    f.transaction,
  ]) {
    assert.equal(fn.mock.callCount(), 0)
  }
}

for (const [name, invoke] of mutations) {
  test(`anonymous ${name} is rejected without writes`, async () => {
    const f = fixture(null)
    await assert.rejects(invoke(f), /Authentication required/)
    assertNoWrites(f)
  })
}

for (const actor of ['member', 'outsider']) {
  for (const [name, invoke] of mutations.filter(([name]) =>
    ['update group', 'delete group', 'remove participant', 'draw'].includes(
      name
    )
  )) {
    test(`${actor} cannot ${name}`, async () => {
      const f = fixture(actor)
      await assert.rejects(invoke(f), /access denied/)
      assertNoWrites(f)
      assert.equal(f.user.findMany.mock.callCount(), 0)
    })
  }
}

test('creation ignores forged actor and owner IDs', async () => {
  const f = fixture('outsider')
  const result = await f.actions.createSecretSantaGroup(
    { ...form, ownerId: 'owner' },
    'owner'
  )
  assert.equal(result.success, true)
  assert.equal(result.group.ownerId, 'outsider')
  assert.equal(
    f.userSecretSantaGroup.create.mock.calls[0].arguments[0].data.userId,
    'outsider'
  )
})

for (const name of [
  'update group',
  'delete group',
  'remove participant',
  'draw',
]) {
  test(`owner can ${name}`, async () => {
    const f = fixture()
    const result = await mutations.find(([key]) => key === name)[1](f)
    assert.equal(result.success, true)
  })
}

test('join derives the actor from the current session at invocation', async () => {
  const f = fixture('member')
  f.setActor('outsider')
  const result = await f.actions.createSecretSantaGroupParticipant(
    'holiday-invite',
    'owner'
  )
  assert.equal(result.success, true)
  const { data } = f.userSecretSantaGroup.create.mock.calls[0].arguments[0]
  assert.equal(data.userId, 'outsider')
  assert.equal(data.secretSantaGroupId, 'group')
})

test('invalid invite causes no writes', async () => {
  const f = fixture('outsider')
  await assert.rejects(
    f.actions.createSecretSantaGroupParticipant('invalid'),
    /not found/
  )
  assertNoWrites(f)
})

test('self-leave ignores a forged target identity', async () => {
  const f = fixture('member')
  assert.equal(
    (await f.actions.leaveSecretSantaGroup('group', 'third')).success,
    true
  )
  assert.equal(f.members.has('member'), false)
  assert.equal(f.members.has('third'), true)
})

test('nonmember cannot leave or remove anyone', async () => {
  const f = fixture('outsider')
  await assert.rejects(
    f.actions.leaveSecretSantaGroup('group', 'member'),
    /access denied/
  )
  assertNoWrites(f)
})

test('owner cannot abandon or remove the owner membership', async () => {
  const f = fixture()
  await assert.rejects(
    f.actions.leaveSecretSantaGroup('group'),
    /owner must delete/
  )
  await assert.rejects(
    f.actions.removeSecretSantaGroupParticipant('group', 'owner'),
    /Invalid participant/
  )
  assertNoWrites(f)
})

test('group list and membership check ignore forged user IDs', async () => {
  const f = fixture('outsider')
  assert.equal((await f.actions.listSecretSantaGroups('owner')).length, 0)
  assert.equal(
    await f.actions.isSecretSantaGroupParticipant('holiday-invite', 'owner'),
    false
  )
  assert.equal(
    f.userSecretSantaGroup.findMany.mock.calls[0].arguments[0].where.userId,
    'outsider'
  )
})

for (const [name, invoke] of [
  ['group list', (f) => f.actions.listSecretSantaGroups('owner')],
  ['group details', (f) => f.actions.getSecretSantaGroup('holiday-invite')],
  ['participants', (f) => f.actions.listSecretSantaGroupParticipants('group')],
  [
    'membership check',
    (f) => f.actions.isSecretSantaGroupParticipant('holiday-invite'),
  ],
  [
    'invitation',
    (f) => f.actions.getSecretSantaGroupInvitation('holiday-invite'),
  ],
]) {
  test(`anonymous ${name} read is rejected`, async () => {
    await assert.rejects(invoke(fixture(null)), /Authentication required/)
  })
}

test('outsiders cannot read group details or participant emails', async () => {
  const f = fixture('outsider')
  await assert.rejects(
    f.actions.getSecretSantaGroup('holiday-invite'),
    /access denied/
  )
  await assert.rejects(
    f.actions.listSecretSantaGroupParticipants('group'),
    /access denied/
  )
  assert.equal(f.user.findMany.mock.callCount(), 0)
})

test('members can read group details and participants', async () => {
  const f = fixture('member')
  assert.equal(
    (await f.actions.getSecretSantaGroup('holiday-invite')).id,
    'group'
  )
  assert.equal(
    (await f.actions.listSecretSantaGroupParticipants('group')).length,
    4
  )
})

test('invitation preview exposes only name, image, and draw status', async () => {
  const f = fixture('outsider')
  const result = await f.actions.getSecretSantaGroupInvitation('holiday-invite')
  assert.deepEqual(Object.keys(result).sort(), ['image', 'isDrawn', 'name'])
})

test('action wrappers report authorization failures without throwing or writing', async () => {
  const f = fixture('outsider')
  for (const invoke of [
    () => f.wrappers.deleteSecretSantaGroupAction('group'),
    () => f.wrappers.holdSecretSantaDrawAction('group'),
    () => f.wrappers.leaveSecretSantaGroupAction('group'),
    () => f.wrappers.removeSecretSantaGroupParticipantAction('group', 'member'),
  ])
    assert.equal((await invoke()).success, false)
  assertNoWrites(f)
})
