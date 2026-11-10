import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import { loadModule } from '../helpers/load-module.mjs'

function nodes(node) {
  if (!node) return []
  if (Array.isArray(node)) return node.flatMap(nodes)
  return [node, ...nodes(node.props?.children)]
}

function fixture(response) {
  let loading = false
  const social = mock.fn(response)
  const error = mock.fn()
  const jsx = (type, props) => ({ type, props })
  const { AuthLoginForm } = loadModule(
    'src/app/(public)/login/ui/Auth-login-form.tsx',
    {
      '@/components/ui/button': { Button: 'button' },
      '@/components/ui/form/form-error': { FormError: 'error' },
      '@/components/ui/form/form-input-wrapper': { InputWrapper: 'wrapper' },
      '@/components/ui/input': { Input: 'input', PasswordInput: 'input' },
      '@/components/ui/label': { Label: 'label' },
      '@/lib/auth-client': { authClient: { signIn: { social } } },
      '@/lib/auth-callback': { getSafeAuthCallbackPath: () => '/wishlist' },
      '@/schemas/auth': { signInFormSchema: {} },
      '@hookform/resolvers/zod': { zodResolver: () => ({}) },
      'lucide-react': { LoaderCircle: 'spinner' },
      'next/image': 'img',
      'next/navigation': {
        useRouter: () => ({}),
        useSearchParams: () => new URLSearchParams(),
      },
      react: {
        useState: () => [
          loading,
          (value) => {
            loading = value
          },
        ],
      },
      'react-hook-form': {
        useForm: () => ({
          register: () => ({}),
          handleSubmit: (callback) => callback,
          setError() {},
          formState: { errors: {}, isSubmitting: false },
        }),
      },
      sonner: { toast: { error } },
      'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
    },
    {
      URLSearchParams,
      process: { env: { NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED: 'true' } },
    }
  )
  const button = () =>
    nodes(AuthLoginForm({ setFormType() {} })).find(
      (n) => n.type === 'button' && n.props.onClick
    )
  return { social, error, button }
}

for (const [name, response] of [
  [
    'API error',
    async () => ({ error: { code: 'INTERNAL_SERVER_ERROR' }, data: null }),
  ],
  [
    'network failure',
    async () => {
      throw new TypeError('Failed to fetch')
    },
  ],
  [
    'timeout',
    async () => {
      throw new DOMException('Timeout', 'AbortError')
    },
  ],
  ['missing redirect', async () => ({ data: {}, error: null })],
]) {
  test(`Google ${name} shows feedback and re-enables the actual login button`, async () => {
    const f = fixture(response)
    await f.button().props.onClick()
    assert.equal(f.button().props.disabled, false)
    assert.equal(f.error.mock.callCount(), 1)
    f.social.mock.mockImplementation(async () => ({
      data: { url: 'https://accounts.google.com/', redirect: true },
      error: null,
    }))
    await f.button().props.onClick()
    assert.equal(f.error.mock.callCount(), 1)
    assert.equal(f.social.mock.calls[1].arguments[0].callbackURL, '/wishlist')
    assert.equal(f.social.mock.calls[1].arguments[1].timeout, 15000)
  })
}
