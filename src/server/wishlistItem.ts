"use server"

import { CreateWishlistItemFormData } from "@/types/wishlistItem";
import { db } from "@/lib/database/db";


export const createWishlistItem = async (formData: CreateWishlistItemFormData, user_id: string) => {
    const { name, description, price, link, image, priority } = formData;

    const newWishlistItemData = {
        name: name ?? null,
        price: price ?? null,
        description: description ?? null,
        image: image ?? null,
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