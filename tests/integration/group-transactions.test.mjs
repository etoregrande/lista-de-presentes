import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { randomUUID } from 'node:crypto'
import { PrismaPg } from '@prisma/adapter-pg'
import prismaExports from '../../src/generated/prisma/index.js'
import { loadModule } from '../helpers/load-module.mjs'
import { validationModules, utils } from '../helpers/validation-modules.mjs'

const url = process.env.TEST_DATABASE_URL
assert.ok(
  url,
  'Run through npm run test:integration; an isolated PostgreSQL is required'
)
const parsed = new URL(url)
assert.equal(parsed.hostname, 'localhost')
assert.equal(parsed.pathname, '/presenteio_test')
assert.match(parsed.searchParams.get('host') ?? '', /presenteio-pg-test-/)
const prisma = new prismaExports.PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
})
after(async () => prisma.$disconnect())
before(async () => {
  await prisma.user.createMany({
    data: ['owner', 'member', 'third', 'fourth', 'newcomer', 'failowner'].map(
      (id) => ({
        id,
        name: id,
        email: `${id}@example.test`,
        emailVerified: true,
      })
    ),
  })
})

function actions(actor, database = prisma) {
  return loadModule('src/server/secretSantaGroup.ts', {
    ...validationModules,
    './session': { requireAuthenticatedUserId: async () => actor },
    '@/lib/prisma': { prisma: database },
    '@/lib/error': { isPrismaP2002: (error) => error?.code === 'P2002' },
    '@/lib/utils': {
      drawSecretSanta: utils.drawSecretSanta,
      generateSecretSantaGroupSlug: () => `test-${randomUUID()}`,
    },
  })
}

async function newGroup(count = 4) {
  const ids = ['owner', 'member', 'third', 'fourth'].slice(0, count)
  return prisma.secretSantaGroup.create({
    data: {
      name: randomUUID(),
      slug: randomUUID(),
      ownerId: 'owner',
      participants: { create: ids.map((userId) => ({ userId })) },
    },
  })
}

async function assertConsistent(groupId) {
  const group = await prisma.secretSantaGroup.findUnique({
    where: { id: groupId },
    include: { participants: true, secretSantaDraws: true },
  })
  const draws = group.secretSantaDraws
  if (!group.isDrawn) {
    assert.equal(draws.length, 0)
    assert.equal(group.drawDate, null)
    return group
  }
  assert.ok(group.drawDate)
  assert.ok(group.participants.length >= 4)
  const members = group.participants.map((p) => p.userId).sort()
  assert.deepEqual(draws.map((d) => d.giverId).sort(), members)
  assert.deepEqual(draws.map((d) => d.receiverId).sort(), members)
  for (const draw of draws) assert.notEqual(draw.giverId, draw.receiverId)
  return group
}

test('nested group creation includes its owner membership', async () => {
  const result = await actions('owner').createSecretSantaGroup({
    name: randomUUID(),
    priceLimit: null,
    eventDate: null,
  })
  assert.equal(result.success, true)
  assert.ok(
    await prisma.userSecretSantaGroup.findUnique({
      where: {
        userId_secretSantaGroupId: {
          userId: 'owner',
          secretSantaGroupId: result.group.id,
        },
      },
    })
  )
})

test('membership insertion failure rolls back group creation', async () => {
  await prisma.$executeRawUnsafe(
    `CREATE FUNCTION fail_membership() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW."userId" = 'failowner' THEN RAISE EXCEPTION 'Injected failure'; END IF; RETURN NEW; END $$`
  )
  await prisma.$executeRawUnsafe(
    'CREATE TRIGGER fail_membership BEFORE INSERT ON users_secret_santa_groups FOR EACH ROW EXECUTE FUNCTION fail_membership()'
  )
  try {
    const result = await actions('failowner').createSecretSantaGroup({
      name: randomUUID(),
      priceLimit: null,
      eventDate: null,
    })
    assert.equal(result.success, false)
    assert.equal(
      await prisma.secretSantaGroup.count({ where: { ownerId: 'failowner' } }),
      0
    )
  } finally {
    await prisma.$executeRawUnsafe(
      'DROP TRIGGER fail_membership ON users_secret_santa_groups'
    )
    await prisma.$executeRawUnsafe('DROP FUNCTION fail_membership()')
  }
})

test('two concurrent draws produce exactly one complete draw', async () => {
  const group = await newGroup()
  const owner = actions('owner')
  const results = await Promise.all([
    owner.createSecretSantaGroupDraw(group.id),
    owner.createSecretSantaGroupDraw(group.id),
  ])
  assert.equal(results.filter((r) => r.success).length, 1)
  assert.equal((await assertConsistent(group.id)).secretSantaDraws.length, 4)
})

test('joining concurrently with a draw cannot leave an unassigned member', async () => {
  const group = await newGroup()
  const results = await Promise.allSettled([
    actions('newcomer').createSecretSantaGroupParticipant(group.slug),
    actions('owner').createSecretSantaGroupDraw(group.id),
  ])
  assert.equal(results[1].status, 'fulfilled')
  assert.equal(results[1].value.success, true)
  const final = await assertConsistent(group.id)
  assert.equal(
    final.participants.some((p) => p.userId === 'newcomer'),
    results[0].status === 'fulfilled'
  )
})

for (const mutation of ['leave', 'remove']) {
  test(`${mutation} concurrent with a draw preserves the participant snapshot`, async () => {
    const group = await newGroup()
    await Promise.allSettled([
      mutation === 'leave'
        ? actions('member').leaveSecretSantaGroup(group.id)
        : actions('owner').removeSecretSantaGroupParticipant(
            group.id,
            'member'
          ),
      actions('owner').createSecretSantaGroupDraw(group.id),
    ])
    await assertConsistent(group.id)
  })
}

test('completed draws reject membership changes and repeated draws', async () => {
  const group = await newGroup()
  const owner = actions('owner')
  assert.equal((await owner.createSecretSantaGroupDraw(group.id)).success, true)
  await assert.rejects(
    actions('newcomer').createSecretSantaGroupParticipant(group.slug)
  )
  await assert.rejects(actions('member').leaveSecretSantaGroup(group.id))
  await assert.rejects(
    owner.removeSecretSantaGroupParticipant(group.id, 'member')
  )
  assert.equal(
    (await owner.createSecretSantaGroupDraw(group.id)).success,
    false
  )
  const final = await assertConsistent(group.id)
  assert.equal(final.participants.length, 4)
})

test('draw failure after assignment insertion rolls back assignments and group state', async () => {
  const group = await newGroup()
  const failing = new Proxy(prisma, {
    get(target, property) {
      if (property !== '$transaction') return Reflect.get(target, property)
      return (callback) =>
        prisma.$transaction((tx) =>
          callback(
            new Proxy(tx, {
              get(client, key) {
                if (key === 'secretSantaGroup')
                  return {
                    update: async () => {
                      throw new Error('Injected failure')
                    },
                  }
                return Reflect.get(client, key)
              },
            })
          )
        )
    },
  })
  assert.equal(
    (await actions('owner', failing).createSecretSantaGroupDraw(group.id))
      .success,
    false
  )
  await assertConsistent(group.id)
  assert.equal(
    (await prisma.secretSantaGroup.findUnique({ where: { id: group.id } }))
      .isDrawn,
    false
  )
})

test('insufficient participants leave the group undrawn and joinable', async () => {
  const group = await newGroup(3)
  assert.equal(
    (await actions('owner').createSecretSantaGroupDraw(group.id)).success,
    false
  )
  await assertConsistent(group.id)
  assert.equal(
    (await actions('newcomer').createSecretSantaGroupParticipant(group.slug))
      .success,
    true
  )
  assert.equal(
    (await actions('owner').createSecretSantaGroupDraw(group.id)).success,
    true
  )
  await assertConsistent(group.id)
})
