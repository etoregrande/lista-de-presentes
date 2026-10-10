import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as jsxRuntime from 'react/jsx-runtime'
import { NumericFormat } from 'react-number-format'
import { loadModule } from '../helpers/load-module.mjs'

function priceInput(initialPrice = null) {
  let price = initialPrice
  const Controller = () => null
  const dependencies = {
    'react/jsx-runtime': jsxRuntime,
    react: { useState: () => [null, () => {}], useEffect: () => {} },
    'react-hook-form': {
      Controller,
      useFormContext: () => ({
        register: () => ({}),
        watch: () => null,
        formState: { errors: {} },
      }),
    },
    'react-number-format': { NumericFormat },
    'next/image': { default: () => null },
    '@/../public/assets/wishlist-item-placeholder.svg': { default: '' },
  }
  for (const [module, name] of [
    ['label', 'Label'],
    ['input', 'Input'],
    ['aspect-ratio', 'AspectRatio'],
    ['textarea', 'Textarea'],
    ['switch', 'Switch'],
    ['form/form-error', 'FormError'],
    ['form/form-input-wrapper', 'InputWrapper'],
  ]) {
    dependencies[`@/components/ui/${module}`] = { [name]: () => null }
  }
  const { WishlistNewItemSheetForm } = loadModule(
    'src/app/(auth)/wishlist/ui/Wishlist-new-item-sheet-form.tsx',
    dependencies
  )
  function findPrice(node) {
    if (!node || typeof node !== 'object') return
    if (node.type === Controller && node.props.name === 'price') return node
    for (const child of [node.props?.children].flat()) {
      const found = findPrice(child)
      if (found) return found
    }
  }
  const controller = findPrice(WishlistNewItemSheetForm())
  return {
    render: () =>
      controller.props.render({
        field: {
          value: price,
          onChange: (value) => {
            price = value
          },
        },
      }).props,
    value: () => price,
  }
}

test('decimal prices convert to whole cents', () => {
  for (const [amount, cents] of [
    [0.29, 29],
    [19.9, 1990],
    [1.1, 110],
  ]) {
    const input = priceInput()
    input.render().onValueChange({ floatValue: amount })
    assert.equal(input.value(), cents)
    assert.equal(Number.isInteger(input.value()), true)
    assert.equal(input.render().value, amount)
  }
})

test('zero stays visible while entering a price below one real', () => {
  const input = priceInput()
  assert.equal(input.render().value, '')
  input.render().onValueChange({ floatValue: 0 })
  assert.equal(input.render().value, 0)
  input.render().onValueChange({ floatValue: 0, value: '0.' })
  assert.equal(input.render().value, 0)
  input.render().onValueChange({ floatValue: 0.5 })
  assert.equal(input.value(), 50)
  input.render().onValueChange({ floatValue: undefined })
  assert.equal(input.value(), null)
  assert.equal(input.render().value, '')
})
