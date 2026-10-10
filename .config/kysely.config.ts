import { defineConfig } from 'kysely-ctl'
import { dialect } from '../src/lib/database/db'

export default defineConfig({
  // replace me with a real dialect instance OR a dialect name + `dialectConfig` prop.
  dialect: dialect,
  migrations: {
    migrationFolder: 'src/lib/database/migrations',
  },
  //   plugins: [],
  //   seeds: {
  //     seedFolder: "seeds",
  //   }
})
