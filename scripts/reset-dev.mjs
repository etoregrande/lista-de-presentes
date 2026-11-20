import { spawnSync } from 'node:child_process'

const env = {
  ...process.env,
  APP_ENV: 'local',
  SEED_DEMO_DATA: 'true',
  DATABASE_URL: 'postgresql://presenteio:presenteio_dev@127.0.0.1:5434/presenteio_dev',
}
const generated = spawnSync('npx', ['prisma', 'generate'], { stdio: 'inherit', env })
if (generated.status !== 0) process.exit(generated.status || 1)

const result = spawnSync('npx', ['prisma', 'migrate', 'reset', '--force'], {
  stdio: 'inherit',
  env,
})
if (result.status !== 0) process.exit(result.status || 1)
