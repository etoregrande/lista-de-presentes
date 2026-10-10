const DEFAULT_CALLBACK_PATH = '/wishlist'
const CALLBACK_ORIGIN = 'https://callback.invalid'
const UNSAFE_CHARACTERS = /[\\\u0000-\u001f\u007f]/

/** Accept only local paths; never pass an untrusted URL to the router or OAuth. */
export function getSafeAuthCallbackPath(
  value: string | null | undefined
): string {
  if (
    typeof value !== 'string' ||
    value !== value.trim() ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    UNSAFE_CHARACTERS.test(value)
  ) {
    return DEFAULT_CALLBACK_PATH
  }

  try {
    // Reject malformed escapes, including those in query strings and fragments.
    decodeURIComponent(value)
    const url = new URL(value, CALLBACK_ORIGIN)
    if (url.origin !== CALLBACK_ORIGIN) return DEFAULT_CALLBACK_PATH

    let pathname = url.pathname
    for (let depth = 0; depth < 5; depth++) {
      if (
        !pathname.startsWith('/') ||
        pathname.startsWith('//') ||
        UNSAFE_CHARACTERS.test(pathname)
      ) {
        return DEFAULT_CALLBACK_PATH
      }
      if (!/%[0-9a-f]{2}/i.test(pathname)) {
        return `${url.pathname}${url.search}${url.hash}`
      }
      pathname = decodeURIComponent(pathname)
    }
  } catch {
    return DEFAULT_CALLBACK_PATH
  }

  return DEFAULT_CALLBACK_PATH
}
