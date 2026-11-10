import { lookup } from 'node:dns/promises'
import { request as httpRequest, type RequestOptions } from 'node:http'
import { request as httpsRequest } from 'node:https'
import ipaddr from 'ipaddr.js'

export function isPublicAddress(address: string) {
  try {
    return ipaddr.process(address).range() === 'unicast'
  } catch {
    return false
  }
}

export function normalizeProductUrl(input: string): URL {
  if (typeof input !== 'string' || input.length > 4096 || !input.trim())
    throw new Error('INVALID_URL')
  const value = input.trim()
  const url = new URL(
    /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`
  )
  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.port ||
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    (!host.includes('.') && !host.includes(':')) ||
    (ipaddr.isValid(host) && !isPublicAddress(host))
  )
    throw new Error('INVALID_URL')
  return url
}

/** Resolve and pin a public address on each hop; never forward credentials or cookies. */
export async function fetchPublicPage(
  input: string,
  options: { maxBytes?: number; timeoutMs?: number } = {}
) {
  const maxBytes = options.maxBytes ?? 4 * 1024 * 1024
  const deadline = Date.now() + (options.timeoutMs ?? 12000)
  let url = normalizeProductUrl(input)
  for (let hop = 0; hop < 5; hop++) {
    const remaining = deadline - Date.now()
    if (remaining <= 0) throw new Error('IMPORT_TIMEOUT')
    const response = await new Promise<{
      body: Buffer
      status: number
      location?: string
      contentType: string
    }>((resolve, reject) => {
      const request = url.protocol === 'https:' ? httpsRequest : httpRequest
      const requestOptions: RequestOptions & { autoSelectFamily: boolean } = {
        agent: false,
        autoSelectFamily: false,
        signal: AbortSignal.timeout(remaining),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9',
          Accept: '*/*',
        },
        lookup: (hostname, _options, callback) => {
          lookup(hostname, { all: true })
            .then((addresses) => {
              if (
                !addresses.length ||
                addresses.some((a) => !isPublicAddress(a.address))
              ) {
                callback(new Error('PRIVATE_ADDRESS'), '', 4)
                return
              }
              // This exact IP is used for the socket, preventing a second DNS lookup/rebinding.
              const address = addresses[0]
              callback(null, address.address, address.family)
            })
            .catch((error) => callback(error, '', 4))
        },
      }
      const req = request(url, requestOptions, (res) => {
        const status = res.statusCode ?? 0
        const contentType = String(res.headers['content-type'] ?? '')
        if ([301, 302, 303, 307, 308].includes(status)) {
          res.destroy()
          resolve({
            status,
            location: res.headers.location,
            contentType,
            body: Buffer.alloc(0),
          })
          return
        }
        if (
          res.headers['content-encoding'] &&
          res.headers['content-encoding'] !== 'identity'
        ) {
          res.destroy()
          reject(new Error('UNSUPPORTED_ENCODING'))
          return
        }
        if (Number(res.headers['content-length']) > maxBytes) {
          res.destroy()
          reject(new Error('RESPONSE_TOO_LARGE'))
          return
        }
        const chunks: Buffer[] = []
        let size = 0
        res.on('data', (chunk: Buffer) => {
          size += chunk.length
          if (size > maxBytes) {
            res.destroy(new Error('RESPONSE_TOO_LARGE'))
            return
          }
          chunks.push(chunk)
        })
        res.on('error', reject)
        res.on('end', () =>
          resolve({ status, contentType, body: Buffer.concat(chunks) })
        )
      })
      req.on('error', reject)
      req.end()
    })
    if (response.location) {
      url = normalizeProductUrl(new URL(response.location, url).href)
      continue
    }
    if (response.status < 200 || response.status >= 300)
      throw new Error('STORE_UNAVAILABLE')
    return { ...response, url: url.href }
  }
  throw new Error('TOO_MANY_REDIRECTS')
}
