import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import { loadModule } from '../helpers/load-module.mjs'

function findElements(node, type) {
  if (!node) return []
  if (Array.isArray(node))
    return node.flatMap((child) => findElements(child, type))
  return [
    ...(node.type === type ? [node] : []),
    ...findElements(node.props?.children, type),
  ]
}

function fixture(kind, response, search = '?token=test-token') {
  const api = mock.fn(response)
  const success = mock.fn()
  const error = mock.fn()
  const setError = mock.fn()
  const clearErrors = mock.fn()
  const replace = mock.fn()
  const timers = []
  let completed = false
  const jsx = (type, props) => ({ type, props })
  const dependencies = {
    '@/lib/auth-client': {
      authClient: { requestPasswordReset: api, resetPassword: api },
    },
    '@/schemas/auth': {
      forgotPasswordFormSchema: {},
      resetPasswordFormSchema: {},
    },
    '@hookform/resolvers/zod': { zodResolver: () => ({}) },
    'react-hook-form': {
      useForm: () => ({
        register: () => ({}),
        handleSubmit: (callback) => callback,
        setError,
        clearErrors,
        // RHF marks a resolved handler successful even if the API returned an error.
        formState: {
          errors: {},
          isSubmitting: false,
          isSubmitSuccessful: true,
        },
      }),
    },
    react: {
      useState: () => [
        completed,
        (value) => {
          completed = value
        },
      ],
    },
    'next/navigation': { useRouter: () => ({ replace }) },
    sonner: { toast: { success, error } },
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
    '@radix-ui/react-label': { Label: 'label' },
    'lucide-react': { LoaderCircle: 'loader' },
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
  }
  const filename =
    kind === 'request'
      ? 'src/app/(public)/login/ui/Auth-forgot-password-form.tsx'
      : 'src/app/(public)/reset-password/Reset-password-form.tsx'
  const formModule = loadModule(filename, dependencies, {
    URLSearchParams,
    window: { location: { search } },
    setTimeout(callback, delay) {
      timers.push({ callback, delay })
    },
  })
  const Form =
    kind === 'request'
      ? formModule.AuthForgotPasswordForm
      : formModule.ResetPasswordForm
  const render = () => Form({ setFormType() {} })
  const submit = (data) =>
    findElements(render(), 'form')[0].props.onSubmit(data)
  const buttonDisabled = () =>
    findElements(render(), 'button')[0].props.disabled
  return {
    api,
    success,
    error,
    setError,
    clearErrors,
    replace,
    timers,
    submit,
    buttonDisabled,
  }
}

const recovery = { email: 'person@example.test' }
const password = { password: 'a-new-password' }

for (const kind of ['request', 'reset']) {
  for (const [name, response] of [
    ['API error', async () => ({ error: { code: 'INTERNAL_SERVER_ERROR' } })],
    [
      'network error',
      async () => {
        throw new Error('Network unavailable')
      },
    ],
  ]) {
    test(`${kind} handles ${name} without a false success or blocked retry`, async () => {
      const f = fixture(kind, response)
      await f.submit(kind === 'request' ? recovery : password)
      assert.equal(f.success.mock.callCount(), 0)
      assert.equal(f.error.mock.callCount(), 1)
      assert.equal(f.setError.mock.calls[0].arguments[0], 'root')
      assert.equal(f.clearErrors.mock.calls[0].arguments[0], 'root')
      assert.equal(f.buttonDisabled(), false)
      assert.equal(f.replace.mock.callCount(), 0)
      assert.equal(f.timers.length, 0)
      f.api.mock.mockImplementation(async () => ({ error: null }))
      await f.submit(kind === 'request' ? recovery : password)
      assert.equal(f.success.mock.callCount(), 1)
    })
  }
}

test('recovery success preserves the entered email in its conditional acknowledgement', async () => {
  const f = fixture('request', async () => ({ error: null }))
  await f.submit(recovery)
  assert.equal(f.api.mock.calls[0].arguments[0].email, recovery.email)
  assert.equal(f.api.mock.calls[0].arguments[0].redirectTo, '/reset-password')
  assert.equal(
    f.success.mock.calls[0].arguments[0],
    `Se ${recovery.email} estiver cadastrado, você receberá um link de recuperação`
  )
  assert.equal(f.error.mock.callCount(), 0)
})

for (const search of [
  '',
  '?error=INVALID_TOKEN',
  '?token=test-token&error=INVALID_TOKEN',
]) {
  test(`missing or invalid reset link ${JSON.stringify(search)} shows an error without an API call`, async () => {
    const f = fixture('reset', async () => ({ error: null }), search)
    await f.submit(password)
    assert.equal(f.api.mock.callCount(), 0)
    assert.equal(f.success.mock.callCount(), 0)
    assert.match(
      f.error.mock.calls[0].arguments[0],
      /link é inválido ou expirou/
    )
    assert.equal(f.buttonDisabled(), false)
  })
}

test('expired or used token returned by the API prompts a new recovery request', async () => {
  const f = fixture('reset', async () => ({ error: { code: 'INVALID_TOKEN' } }))
  await f.submit(password)
  assert.match(f.error.mock.calls[0].arguments[0], /Solicite um novo link/)
  assert.equal(f.success.mock.callCount(), 0)
  assert.equal(f.buttonDisabled(), false)
})

test('successful reset disables the button and redirects only after success', async () => {
  const f = fixture('reset', async () => ({ error: null }))
  await f.submit(password)
  const body = f.api.mock.calls[0].arguments[0]
  assert.equal(body.newPassword, password.password)
  assert.equal(body.token, 'test-token')
  assert.equal(f.buttonDisabled(), true)
  assert.equal(f.success.mock.callCount(), 1)
  assert.equal(f.error.mock.callCount(), 0)
  assert.equal(f.replace.mock.callCount(), 0)
  assert.equal(f.timers[0].delay, 2000)
  f.timers[0].callback()
  assert.equal(f.replace.mock.calls[0].arguments[0], '/login')
})
