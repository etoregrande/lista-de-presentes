import 'dotenv/config'
import { DB } from '@/types/db';
import {
    Kysely,
    PostgresDialect,
} from 'kysely';
import { Pool } from 'pg'

// Exported only to connect to better-auth
export const dialect = new PostgresDialect({
    pool: new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
    })
})

export const db = new Kysely<DB>({
    dialect
});