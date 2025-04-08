'use server'

import 'dotenv/config'
import { EditWishlistItemFormDataType, WishlistItem, type CreateWishlistItemFormDataType } from "@/types/wishlistItem";
import { db } from "@/lib/database/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '@/lib/database/s3';
import { sql } from 'kysely';



export const createWishlistItem = async (
    formData: CreateWishlistItemFormDataType,
    userId: string
) => {
    const { name } = formData;

    const newWishlistItemData = {
        name: name,
        user_id: userId ?? null,
    }

    try {
        const newWishlistItem = await db
            .insertInto("wishlist_item")
            .values(newWishlistItemData)
            .returning(["id", "name", "description", "price", "link", "image", "priority", "user_id", "is_active"])
            .executeTakeFirst();

        if (!newWishlistItem) {
            throw new Error('Error creating wishlist item')
        }

        return newWishlistItem;

    } catch (error) {
        console.error("Error creating wishlist item =>", error);
        return null;
    }
}

export const listWishlistItems = async (user_id?: string) => {
    let userId

    if (!user_id) {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) {
            throw new Error('Unable to get session')
        }

        userId = session.user.id
    } else {
        userId = user_id
    }

    try {
        const wishlistItems = await db
            .selectFrom("wishlist_item")
            .selectAll()
            .where('user_id', '=', userId)
            .orderBy('is_active', 'asc')
            .orderBy(
                sql`
                CASE 
                WHEN priority = 'alta' THEN 1
                WHEN priority = 'normal' THEN 2
                WHEN priority = 'baixa' THEN 3
                END
                `,
                'desc'
            )
            .execute()

        return wishlistItems;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch Wishlist items.');
    }
}

export const editWishlistItem = async (
    formData: EditWishlistItemFormDataType,
    wishlistItemId: string,
    userId: string
) => {
    const { name, description, price, link, image, priority, isActive } = formData;
    let imageUrl: string | null = null

    if (image?.[0]) {
        try {
            const imageBuffer = image[0].buffer ? image[0].buffer : Buffer.from(await image[0].arrayBuffer())

            const params = {
                Bucket: process.env.BUCKET_NAME,
                Key: `${Date.now()}-${image[0].name}`,
                Body: imageBuffer,
                ContentType: image[0].type
            };

            const command = new PutObjectCommand(params)
            await s3.send(command)

            imageUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${params.Key}`;

            const existingItem = await db
                .selectFrom("wishlist_item")
                .select(["image"])
                .where("id", "=", wishlistItemId)
                .where("user_id", "=", userId)
                .executeTakeFirst();

            if (existingItem?.image) {
                const imageKey = existingItem.image.split('/').pop()
                const deleteParams = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: imageKey
                };
                await s3.send(new DeleteObjectCommand(deleteParams));
            }
        } catch (error) {
            throw new Error('Error handling images on S3')
        }
    }

    const editedWishlistItemData: WishlistItem = {
        name: name,
        price: price ? price * 100 : null,
        description: description ?? undefined,
        link: link ?? undefined,
        priority: priority,
        is_active: isActive,
    }

    if (imageUrl) {
        editedWishlistItemData.image = imageUrl
    }

    try {
        const editedWishlistItem = await db
            .updateTable("wishlist_item")
            .set(editedWishlistItemData)
            .where("id", "=", wishlistItemId)
            .returning(["id", "name", "description", "price", "link", "image", "priority", "user_id", "is_active"])
            .executeTakeFirst();

        if (!editedWishlistItem) {
            throw new Error('Error editing wishlist item')
        }

        return editedWishlistItem;

    } catch (error) {
        console.error("Error creating wishlist item =>", error);
        return null;
    }
}

export const deleteWishlistItem = async (
    wishlistItemId: string
) => {
    try {
        const deletedWishlistItem = await db
            .deleteFrom("wishlist_item")
            .where("id", "=", wishlistItemId)
            .returning(["image"])
            .executeTakeFirst();

        if (!deletedWishlistItem) {
            throw new Error('Error deleting wishlist item')
        }
        if (deletedWishlistItem.image) {
            const imageKey = deletedWishlistItem.image.split('/').pop()
            const deleteParams = {
                Bucket: process.env.BUCKET_NAME,
                Key: imageKey
            };
            await s3.send(new DeleteObjectCommand(deleteParams));
        }
        return
    } catch (error) {
        console.error("Error deleting wishlist item =>", error);
        return null;
    }
}