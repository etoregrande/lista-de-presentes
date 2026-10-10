import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadModule } from '../helpers/load-module.mjs'

const participants = Object.freeze(
  ['ana', 'bruno', 'carla', 'diego'].map((id) =>
    Object.freeze({ id, name: id })
  )
)

// Enumerate every choice made by Fisher–Yates for this fixture. Each test
// exercises every possible shuffle, without depending on random sampling.
function* shuffleChoices(remaining = participants.length, choices = []) {
  if (remaining <= 1) {
    yield choices
    return
  }
  for (let index = 0; index < remaining; index++) {
    yield* shuffleChoices(remaining - 1, [
      ...choices,
      (index + 0.5) / remaining,
    ])
  }
}

function forEveryDraw(check) {
  let choices
  const math = Object.create(Math)
  math.random = () => {
    assert.ok(choices.length > 0, 'Unexpected random call')
    return choices.shift()
  }
  const { drawSecretSanta } = loadModule(
    'src/lib/utils.ts',
    {
      clsx: { clsx() {} },
      'tailwind-merge': { twMerge() {} },
      psl: {},
      nanoid: { nanoid() {} },
      slugify() {},
    },
    { Math: math }
  )

  for (const sequence of shuffleChoices()) {
    choices = [...sequence]
    const result = drawSecretSanta(participants)
    assert.ok(result)
    assert.equal(choices.length, 0, 'All shuffle choices must be consumed')
    check(result)
  }
}

test('every participant gives and receives once without drawing themselves', () => {
  const ids = participants.map(({ id }) => id).sort()
  forEveryDraw((result) => {
    assert.deepEqual(Array.from(result, ({ giverId }) => giverId).sort(), ids)
    assert.deepEqual(
      Array.from(result, ({ receiverId }) => receiverId).sort(),
      ids
    )
    for (const { giverId, receiverId } of result) {
      assert.notEqual(giverId, receiverId)
    }
  })
})

test('the draw never produces reciprocal pairs', () => {
  forEveryDraw((result) => {
    const receivers = new Map(
      result.map((draw) => [draw.giverId, draw.receiverId])
    )
    for (const { giverId, receiverId } of result) {
      assert.notEqual(receivers.get(receiverId), giverId)
    }
  })
})

test('the draw forms one cycle containing every participant', () => {
  forEveryDraw((result) => {
    const receivers = new Map(
      result.map((draw) => [draw.giverId, draw.receiverId])
    )
    const visited = new Set()
    const first = participants[0].id
    let current = first

    while (!visited.has(current)) {
      assert.ok(receivers.has(current), 'Cycle must stay within participants')
      visited.add(current)
      current = receivers.get(current)
    }

    assert.equal(current, first)
    assert.deepEqual(
      [...visited].sort(),
      participants.map(({ id }) => id).sort()
    )
  })
})

test('the draw preserves the input order and participant objects', () => {
  const original = participants.map((participant) => ({ ...participant }))
  forEveryDraw(() => {
    assert.deepEqual(participants, original)
  })
})
