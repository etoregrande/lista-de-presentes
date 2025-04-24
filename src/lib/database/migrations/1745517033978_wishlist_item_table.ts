// migrations/xxxx_create_wishlist_item_table_with_foreign_key.ts
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Criação da tabela wishlist_item
  await db.schema
    .createTable('wishlist_item')
    .addColumn('id', 'uuid', (col) =>
      col.defaultTo(sql`gen_random_uuid()`).primaryKey()
    )
    .addColumn('name', 'varchar(255)', (col) =>
      col.check(sql`length(name) >= 1`).notNull()
    )
    .addColumn('price', 'integer', (col) => col)
    .addColumn('description', 'text', (col) => col)
    .addColumn('image', 'text', (col) => col)
    .addColumn('link', 'text', (col) => col)
    .addColumn('priority', 'varchar(10)', (col) =>
      col
        .check(sql`priority IN ('alta', 'normal', 'baixa')`)
        .defaultTo('normal')
    )
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true))
    .addColumn('is_purchased', 'boolean', (col) => col.defaultTo(false))
    .addColumn('purchased_at', 'timestamp', (col) => col)
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('user_id', 'text', (col) => col)
    .execute()

  await db.schema
    .alterTable('wishlist_item')
    .addForeignKeyConstraint(
      'wishlist_item_user_id_fkey',
      ['user_id'],
      'user',
      ['id']
    )
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('wishlist_item')
    .dropConstraint('wishlist_item_user_id_fkey')
    .execute()

  await db.schema.dropTable('wishlist_item').execute()
}
