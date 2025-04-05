import { createWishlistItemFormSchema, editWishlistItemFormSchema } from "@/schemas/wishlistItem";
import { z } from "zod";

export type CreateWishlistItemFormDataType = z.infer<typeof createWishlistItemFormSchema>;
export type EditWishlistItemFormDataType = z.infer<typeof editWishlistItemFormSchema>;

export interface WishlistItem {
    created_at?: Date;
    description?: string | undefined;
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