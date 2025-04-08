import { db } from '@/lib/database/db';

export async function getUserById(userId?: string) {
    if (!userId) throw new Error('You must provide a userId')

    const user = db.selectFrom('user')
        .where("id", "=", userId)
        .selectAll()
        .executeTakeFirst();

    return user
}