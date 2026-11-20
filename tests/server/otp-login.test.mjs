import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import { loadModule } from '../helpers/load-module.mjs'
const { getSafeAuthCallbackPath } = loadModule('src/lib/auth-callback.ts', {})

function nodes(node) {
  if (!node) return []
  if (Array.isArray(node)) return node.flatMap(nodes)
  return [node, ...nodes(node.props?.children)]
}

function fixture(callback, userName = 'Etore Grande') {
  const state = []
  let cursor = 0
  const push = mock.fn()
  const refresh = mock.fn()
  const sendVerificationOtp = mock.fn(async () => ({ data: { success: true }, error: null }))
  const emailOtp = mock.fn(async () => ({ data: { user: { name: userName } }, error: null }))
  const social = mock.fn(async () => ({ data: { url: 'https://accounts.google.com' }, error: null }))
  const jsx = (type, props) => ({ type, props })
  const { AuthLoginForm } = loadModule('src/app/(public)/login/ui/Auth-login-form.tsx', {
    react: {
      useState(initial) {
        const index = cursor++
        if (!(index in state)) state[index] = initial
        return [state[index], (value) => { state[index] = value }]
      },
    },
    'next/image': { default: 'image' },
    'next/navigation': {
      useRouter: () => ({ push, refresh }),
      useSearchParams: () => new URLSearchParams(callback ? { callbackUrl: callback } : {}),
    },
    'lucide-react': { LoaderCircle: 'spinner' },
    sonner: { toast: { success() {}, error() {} } },
    '@/lib/auth-client': { authClient: { emailOtp: { sendVerificationOtp }, signIn: { emailOtp, social } } },
    '@/lib/auth-callback': { getSafeAuthCallbackPath },
    '@/schemas/auth': {
      signInFormSchema: { safeParse: ({ email }) => ({ success: true, data: { email } }) },
      otpFormSchema: { safeParse: ({ otp }) => ({ success: true, data: { otp } }) },
    },
    '@/components/ui/button': { Button: 'button' },
    '@/components/ui/input': { Input: 'input' },
    '@/components/ui/label': { Label: 'label' },
    '@/components/ui/form/form-error': { FormError: 'error' },
    '@/components/ui/form/form-input-wrapper': { InputWrapper: 'wrapper' },
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
  }, { process: { env: { NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED: 'true' } } })
  function render() { cursor = 0; return nodes(AuthLoginForm()) }
  return { render, push, refresh, sendVerificationOtp, emailOtp, social }
}

for (const callback of ['javascript:alert(1)', '//other.test', '/groups/holiday/join?ref=invite', null]) {
  test(`OTP and Google use a safe callback: ${callback}`, async () => {
    const f = fixture(callback)
    const expected = getSafeAuthCallbackPath(callback)
    let tree = f.render()
    tree.find((n) => n.type === 'input' && n.props.id === 'email').props.onChange({ target: { value: 'demo@test.com' } })
    tree = f.render()
    await tree.find((n) => n.type === 'form').props.onSubmit({ preventDefault() {} })
    assert.equal(f.sendVerificationOtp.mock.calls[0].arguments[0].type, 'sign-in')
    tree = f.render()
    tree.find((n) => n.type === 'input' && n.props.id === 'otp').props.onChange({ target: { value: '012345' } })
    tree = f.render()
    await tree.find((n) => n.type === 'form').props.onSubmit({ preventDefault() {} })
    assert.equal(f.emailOtp.mock.calls[0].arguments[0].otp, '012345')
    assert.equal(f.push.mock.calls[0].arguments[0], expected)

    const google = fixture(callback)
    const googleButton = google.render().find((n) => n.type === 'button' && n.props['aria-label'] === 'Entrar com o Google')
    await googleButton.props.onClick()
    assert.equal(google.social.mock.calls[0].arguments[0].callbackURL, expected)
  })
}

test('new OTP account is sent to profile completion before the callback', async () => {
  const f = fixture('/groups/holiday/join', '')
  let tree = f.render()
  tree.find((n) => n.type === 'input' && n.props.id === 'email').props.onChange({ target: { value: 'new@test.com' } })
  tree = f.render()
  await tree.find((n) => n.type === 'form').props.onSubmit({ preventDefault() {} })
  tree = f.render()
  tree.find((n) => n.type === 'input' && n.props.id === 'otp').props.onChange({ target: { value: '123456' } })
  tree = f.render()
  await tree.find((n) => n.type === 'form').props.onSubmit({ preventDefault() {} })
  assert.equal(f.push.mock.calls[0].arguments[0], '/complete-profile?callbackUrl=%2Fgroups%2Fholiday%2Fjoin')
})

test('OTP uses a visible autofill input and accepts a pasted code', async () => {
  const f = fixture(null)
  let tree = f.render()
  tree.find((n) => n.type === 'input' && n.props.id === 'email').props.onChange({ target: { value: 'demo@test.com' } })
  tree = f.render()
  await tree.find((n) => n.type === 'form').props.onSubmit({ preventDefault() {} })

  tree = f.render()
  const inputs = tree.filter((n) => n.type === 'input' && n.props.id === 'otp')
  assert.equal(inputs.length, 1)
  assert.equal(inputs[0].props.autoComplete, 'one-time-code')
  assert.equal(inputs[0].props.name, 'otp')
  assert.doesNotMatch(inputs[0].props.className ?? '', /opacity-0/)
  inputs[0].props.onChange({ target: { value: '12 34-56' } })

  tree = f.render()
  assert.equal(tree.find((n) => n.type === 'input' && n.props.id === 'otp').props.value, '123456')
  await tree.find((n) => n.type === 'form').props.onSubmit({ preventDefault() {} })
  assert.equal(f.emailOtp.mock.calls[0].arguments[0].otp, '123456')
})
