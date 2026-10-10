import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import { loadModule } from '../helpers/load-module.mjs'

const callbacks = loadModule('src/lib/auth-callback.ts', {})
const { getSafeAuthCallbackPath } = callbacks

for (const [input, expected] of [
  ['/wishlist', '/wishlist'],
  ['/groups/holiday-Ab12_-/join', '/groups/holiday-Ab12_-/join'],
  [
    '/wishlist/shared/owner?priceLimit=123.45#gift',
    '/wishlist/shared/owner?priceLimit=123.45#gift',
  ],
  ['/groups/família/join', '/groups/fam%C3%ADlia/join'],
  ['/wishlist?label=50%25', '/wishlist?label=50%25'],
  [
    '/wishlist?next=https%3A%2F%2Fexample.test',
    '/wishlist?next=https%3A%2F%2Fexample.test',
  ],
  ['/a/../wishlist', '/wishlist'],
  ['/wishlist#section', '/wishlist#section'],
  ['/', '/'],
]) {
  test(`callback preserves safe path ${input}`, () => {
    assert.equal(getSafeAuthCallbackPath(input), expected)
  })
}

for (const input of [
  null,
  undefined,
  '',
  'wishlist',
  '?callback=/wishlist',
  '#wishlist',
  'https://example.test/wishlist',
  'http://example.test',
  '//example.test/path',
  '///example.test',
  'javascript:alert(1)',
  'JaVaScRiPt:alert(1)',
  'data:text/html,test',
  'file:///tmp/test',
  ' https://example.test',
  ' /groups/holiday/join',
  '/wishlist ',
  '/\\example.test',
  '\\example.test',
  '/\n/example.test',
  '/\t/example.test',
  '/\r/example.test',
  '/\u0000test',
  '/%2fexample.test',
  '/%2F%2Fexample.test',
  '/%5cexample.test',
  '/%255cexample.test',
  '/%252fexample.test',
  '/%00test',
  '/%0d%0a/example.test',
  '/a/..//example.test',
  '/a/../%2fexample.test',
  '/%2e%2e//example.test',
  '/bad%zz',
  '/bad%',
  '/%E0%A4%A',
  '/wishlist?bad=%zz',
  '/wishlist#bad=%zz',
]) {
  test(`callback rejects unsafe or malformed value ${JSON.stringify(input)}`, () => {
    assert.equal(getSafeAuthCallbackPath(input), '/wishlist')
  })
}

function findElements(node, type) {
  if (!node) return []
  if (Array.isArray(node))
    return node.flatMap((child) => findElements(child, type))
  return [
    ...(node.type === type ? [node] : []),
    ...findElements(node.props?.children, type),
  ]
}

function formFixture(kind, callback) {
  const push = mock.fn()
  const email = mock.fn(async (_body, options) => options.onSuccess())
  const social = mock.fn(async () => ({}))
  const jsx = (type, props) => ({ type, props })
  const dependencies = {
    '@/lib/auth-client': {
      authClient: { signIn: { email, social }, signUp: { email } },
    },
    '@/lib/auth-callback': callbacks,
    '@/schemas/auth': { signInFormSchema: {}, signUpFormSchema: {} },
    '@hookform/resolvers/zod': { zodResolver: () => ({}) },
    'react-hook-form': {
      useForm: () => ({
        register: () => ({}),
        handleSubmit: (callback) => callback,
        setError() {},
        formState: { errors: {}, isSubmitting: false },
      }),
    },
    'next/navigation': {
      useRouter: () => ({ push }),
      useSearchParams: () =>
        callback == null
          ? new URLSearchParams()
          : new URLSearchParams({ callbackUrl: callback }),
    },
    react: { useState: () => [false, () => {}] },
    sonner: { toast: { success() {}, warning() {} } },
    '@/components/ui/button': { Button: 'button' },
    '@/components/ui/form/form-error': { FormError: 'form-error' },
    '@/components/ui/form/form-input-wrapper': {
      InputWrapper: 'input-wrapper',
    },
    '@/components/ui/input': {
      Input: 'input',
      PasswordInput: 'password-input',
    },
    '@/components/ui/label': { Label: 'label' },
    'lucide-react': { LoaderCircle: 'loader' },
    'next/image': { default: 'image' },
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
  }
  const filename =
    kind === 'login' ? 'Auth-login-form.tsx' : 'Auth-sign-up-form.tsx'
  const component = loadModule(
    `src/app/(public)/login/ui/${filename}`,
    dependencies,
    {
      process: { env: { NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED: 'true' } },
    }
  )
  const Form =
    kind === 'login' ? component.AuthLoginForm : component.AuthSignUpForm
  const tree = Form({ setFormType() {} })
  return { tree, email, social, push }
}

for (const kind of ['login', 'signup']) {
  for (const [input, expected] of [
    ['javascript:alert(1)', '/wishlist'],
    ['//example.test/path', '/wishlist'],
    [
      '/groups/holiday-Ab12_-/join?ref=invite',
      '/groups/holiday-Ab12_-/join?ref=invite',
    ],
    [null, '/wishlist'],
  ]) {
    test(`${kind} uses safe callback for email and Google: ${JSON.stringify(input)}`, async () => {
      const f = formFixture(kind, input)
      await findElements(f.tree, 'form')[0].props.onSubmit({
        name: 'Test User',
        email: 'test@example.test',
        password: 'password',
      })
      if (kind === 'login') {
        assert.equal(f.push.mock.calls[0].arguments[0], expected)
      } else {
        assert.equal(f.email.mock.calls[0].arguments[0].callbackURL, expected)
      }
      const socialButton = findElements(f.tree, 'button').find(
        (button) => button.props.onClick
      )
      assert.ok(socialButton)
      await socialButton.props.onClick()
      assert.equal(f.social.mock.calls[0].arguments[0].callbackURL, expected)
    })
  }
}
