'use server'

import 'dotenv/config'
import { type CreateWishlistItemFormDataType } from "@/types/wishlistItem";
import { db } from "@/lib/database/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '@/lib/database/s3';



export const createWishlistItem = async (formData: CreateWishlistItemFormDataType, user_id: string) => {
    const { name, description, price, link, image, priority } = formData;

    if (!process.env.BUCKET_NAME) {
        throw new Error("Missing required environment variable: BUCKET_NAME");
    }

    let imageUrl: string | null = null

    if (image?.[0]) {
        const imageBuffer = image[0].buffer ? image[0].buffer : Buffer.from(await image[0].arrayBuffer())

        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: `${Date.now()}-${image[0].name}`,
            Body: imageBuffer,
            ContentType: image[0].type
        };

        const command = new PutObjectCommand(params)
        const data = await s3.send(command)

        imageUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${params.Key}`;
    }


    const newWishlistItemData = {
        name: name ?? null,
        price: price ?? null,
        description: description ?? null,
        image: imageUrl ?? null,
        link: link ?? null,
        priority: priority ?? null,
        user_id: user_id ?? null
    }

    try {
        const newWishlistItem = await db
            .insertInto("wishlist_item")
            .values(newWishlistItemData)
            .returning(["id", "name", "description", "price", "link", "image", "priority", "user_id"])
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
            .execute()

        return wishlistItems;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch Wishlist items.');
    }
}