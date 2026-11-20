import { connect, createServer } from 'node:net'

function hasListener(port, host) {
  return new Promise((resolve) => {
    const socket = connect({ port, host })
    socket.once('connect', () => { socket.destroy(); resolve(true) })
    socket.once('error', (error) => resolve(error.code !== 'ECONNREFUSED'))
    socket.setTimeout(500, () => { socket.destroy(); resolve(true) })
  })
}

function isAvailableOn(port, host) {
  return new Promise((resolve) => {
    const server = createServer()
    server.once('error', () => resolve(false))
    server.listen(port, host, () => server.close(() => resolve(true)))
  })
}

export async function findAvailablePort(start = 3000, count = 11) {
  for (let port = start; port < start + count; port++) {
    if (
      !(await hasListener(port, '127.0.0.1')) &&
      !(await hasListener(port, '::1')) &&
      (await isAvailableOn(port, '127.0.0.1')) &&
      (await isAvailableOn(port, '::1'))
    ) {
      return port
    }
  }
  throw new Error(`No free port from ${start} to ${start + count - 1}`)
}
