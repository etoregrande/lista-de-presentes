import { DB } from '@/types/db'
import { Kysely } from 'kysely'

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable('user')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('email', 'text', (col) => col.notNull().unique())
    .addColumn('emailVerified', 'boolean', (col) => col.notNull())
    .addColumn('image', 'text', (col) => col)
    .addColumn('createdAt', 'timestamp', (col) => col.notNull())
    .addColumn('updatedAt', 'timestamp', (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('session')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('expiresAt', 'timestamp', (col) => col.notNull())
    .addColumn('token', 'text', (col) => col.notNull().unique())
    .addColumn('createdAt', 'timestamp', (col) => col.notNull())
    .addColumn('updatedAt', 'timestamp', (col) => col.notNull())
    .addColumn('ipAddress', 'text', (col) => col)
    .addColumn('userAgent', 'text', (col) => col)
    .addColumn('userId', 'text', (col) => col.notNull().references('user.id'))
    .execute()

  await db.schema
    .createTable('account')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('accountId', 'text', (col) => col.notNull())
    .addColumn('providerId', 'text', (col) => col.notNull())
    .addColumn('userId', 'text', (col) => col.notNull().references('user.id'))
    .addColumn('accessToken', 'text', (col) => col)
    .addColumn('refreshToken', 'text', (col) => col)
    .addColumn('idToken', 'text', (col) => col)
    .addColumn('accessTokenExpiresAt', 'timestamp', (col) => col)
    .addColumn('refreshTokenExpiresAt', 'timestamp', (col) => col)
    .addColumn('scope', 'text', (col) => col)
    .addColumn('password', 'text', (col) => col)
    .addColumn('createdAt', 'timestamp', (col) => col.notNull())
    .addColumn('updatedAt', 'timestamp', (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('verification')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('identifier', 'text', (col) => col.notNull())
    .addColumn('value', 'text', (col) => col.notNull())
    .addColumn('expiresAt', 'timestamp', (col) => col.notNull())
    .addColumn('createdAt', 'timestamp', (col) => col)
    .addColumn('updatedAt', 'timestamp', (col) => col)
    .execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable('verification').execute()
  await db.schema.dropTable('account').execute()
  await db.schema.dropTable('session').execute()
  await db.schema.dropTable('user').execute()
}
