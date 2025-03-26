import 'dotenv/config'
import { Database } from '@/types/db';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL

// Exported only to connect to better-auth
export const dialect = new PostgresDialect({
    pool: new Pool({
        connectionString: databaseUrl,
        max: 10,
    })
})

export const db = new Kysely<Database>({
    dialect,
})