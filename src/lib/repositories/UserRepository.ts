import { db } from '@/lib/database/db';

export async function getUser(userId?: string, email?: string) {
    if (!userId && !email) throw new Error('You must provide a userId or email')

    const query = db.selectFrom('user')
    if (userId) query.where('id', '=', userId)
    if (email) query.where('email', '=', email)

    return await query.selectAll().executeTakeFirst();
}