import { createWishlistItemFormSchema } from "@/schemas/wishlistItem";
import { z } from "zod";

export type CreateWishlistItemFormData = z.infer<typeof createWishlistItemFormSchema>;