import { defineConfig } from 'kysely-ctl'
import { DummyDriver, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler, Kysely } from 'kysely';
import { dialect } from '../src/lib/database/db'

export default defineConfig({
	// replace me with a real dialect instance OR a dialect name + `dialectConfig` prop.
	dialect: dialect,
	migrations: {
		migrationFolder: "src/lib/database/migrations",
	},
	//   plugins: [],
	//   seeds: {
	//     seedFolder: "seeds",
	//   }
})
