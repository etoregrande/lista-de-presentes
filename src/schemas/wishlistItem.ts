import { z } from "zod";

export const wishlistItemSchema = z.object({
    name: z
        .string()
        .min(1, "Nome é obrigatório")
    ,
    description: z
        .string()
        .optional(),
    price: z
        .coerce.number()
        .nullable(),
    image: z
        .string()
        .nullable(),
    link: z
        .string()
        .nullable(),
    priority: z
        .string()
        .refine(value => ['alta', 'normal', 'baixa'].includes(value), {
            message: 'Prioridade deve ser "alta", "normal", or "baixa"',
        })
        .default('normal'),
    isActive: z
        .boolean()
        .nullable(),
    isPurchased: z
        .boolean()
        .nullable(),
    purchasedAt: z
        .date()
        .nullable(),
});

export const createWishlistItemFormSchema = wishlistItemSchema.omit({
    isActive: true,
    isPurchased: true,
    purchasedAt: true
});