import { spawnSync } from 'node:child_process'

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', env: process.env })
  if (result.status !== 0) process.exit(result.status || 1)
}

run('npx', ['prisma', 'migrate', 'deploy'])

if (process.env.SEED_DEMO_DATA === 'true') {
  if (!['local', 'staging'].includes(process.env.APP_ENV || '')) {
    console.error('Demo seed requires APP_ENV=local or APP_ENV=staging')
    process.exit(1)
  }
  run('npx', ['tsx', 'prisma/seed.ts'])
}
