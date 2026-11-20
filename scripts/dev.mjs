import { spawnSync } from 'node:child_process'
import { findAvailablePort } from './local-port.mjs'

const port = await findAvailablePort()

const env = {
  ...process.env,
  APP_ENV: 'local',
  SEED_DEMO_DATA: 'true',
  MAIL_TRANSPORT: 'mailpit',
  MAILPIT_API_URL: process.env.MAILPIT_API_URL || 'http://127.0.0.1:8025',
  MAILPIT_UI_URL: process.env.MAILPIT_UI_URL || 'http://127.0.0.1:8025',
  MAIL_PREVIEW_OPEN: 'true',
  BETTER_AUTH_URL: `http://localhost:${port}`,
  DATABASE_URL: 'postgresql://presenteio:presenteio_dev@127.0.0.1:5434/presenteio_dev',
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', env })
  if (result.status !== 0) process.exit(result.status || 1)
}

run('docker', ['compose', 'up', '-d', '--wait', 'db', 'mailpit'])
run('npx', ['prisma', 'generate'])
run('npx', ['prisma', 'migrate', 'deploy'])
run('npx', ['tsx', 'prisma/seed.ts'])
console.log(`Presenteio local: http://localhost:${port}`)
run('npx', ['next', 'dev', '-p', String(port)])
