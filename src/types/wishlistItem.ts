import { createWishlistItemFormSchema, editWishlistItemFormSchema } from "@/schemas/wishlistItem";
import { z } from "zod";

export type CreateWishlistItemFormDataType = z.infer<typeof createWishlistItemFormSchema>;
export type EditWishlistItemFormDataType = z.infer<typeof editWishlistItemFormSchema>;

export interface WishlistItem {
    created_at?: Date;
    description?: string | null;
    id?: string;
    image?: string | null;
    is_active?: boolean;
    is_purchased?: boolean;
    link?: string | null;
    name: string;
    price?: number | null;
    priority: string;
    purchased_at?: Date | null;
    user_id?: string;
}

export type Priority = "alta" | "normal" | "baixa";
export type UpdatableWishlistFields = Pick<WishlistItem,
    "is_active" |
    "is_purchased" |
    "priority" |
    "price" |
    "description" |
    "link" |
    "image"
>