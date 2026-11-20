import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import { loadModule } from '../helpers/load-module.mjs'
import { commonSchemas } from '../helpers/validation-modules.mjs'

function fixture(currentUserId = 'alice') {
  const users = new Set(['alice', 'bob', 'carol'])
  const follows = new Set()
  const user = {
    findUnique: mock.fn(async ({ where }) =>
      users.has(where.id) ? { id: where.id } : null
    ),
  }
  const userFollow = {
    upsert: mock.fn(async ({ create }) => {
      follows.add(`${create.followerId}:${create.followedId}`)
    }),
    deleteMany: mock.fn(async ({ where }) => {
      follows.delete(`${where.followerId}:${where.followedId}`)
    }),
  }
  const actions = loadModule('src/server/follow.ts', {
    '@/lib/prisma': { prisma: { user, userFollow } },
    '@/schemas/common': commonSchemas,
    './session': {
      requireAuthenticatedUserId: async () => {
        if (!currentUserId) throw new Error('Authentication required')
        return currentUserId
      },
    },
  })
  return { actions, user, userFollow, follows }
}

test('anonymous callers cannot follow or unfollow', async () => {
  const f = fixture(null)
  await assert.rejects(f.actions.followUser('bob'), /Authentication required/)
  await assert.rejects(f.actions.unfollowUser('bob'), /Authentication required/)
  assert.equal(f.userFollow.upsert.mock.callCount(), 0)
  assert.equal(f.userFollow.deleteMany.mock.callCount(), 0)
})

test('cannot follow yourself, an unknown user, or an invalid ID', async () => {
  const f = fixture()
  await assert.rejects(f.actions.followUser('alice'), /Cannot follow yourself/)
  await assert.rejects(f.actions.followUser('missing'), /User not found/)
  await assert.rejects(f.actions.followUser(' bob '))
  assert.equal(f.userFollow.upsert.mock.callCount(), 0)
})

test('following is idempotent and scoped to the signed-in user', async () => {
  const f = fixture()
  await f.actions.followUser('bob')
  await f.actions.followUser('bob')
  assert.deepEqual([...f.follows], ['alice:bob'])
  assert.deepEqual(
    {
      ...f.userFollow.upsert.mock.calls[0].arguments[0].where
        .followerId_followedId,
    },
    { followerId: 'alice', followedId: 'bob' }
  )
})

test('unfollowing removes only the signed-in user relation', async () => {
  const f = fixture()
  f.follows.add('alice:bob')
  f.follows.add('carol:bob')
  await f.actions.unfollowUser('bob')
  await f.actions.unfollowUser('bob')
  assert.deepEqual([...f.follows], ['carol:bob'])
})
