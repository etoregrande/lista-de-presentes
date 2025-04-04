import { createWishlistItemButtonSchema, createWishlistItemFormSchema } from "@/schemas/wishlistItem";
import { z } from "zod";

export type CreateWishlistItemFormDataType = z.infer<typeof createWishlistItemFormSchema>;
export type CreateWishlistItemButtonType = z.infer<typeof createWishlistItemButtonSchema>;

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