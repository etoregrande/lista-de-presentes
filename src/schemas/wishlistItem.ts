import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

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
        .any()
        .refine(
            (file) => !file || (file.length === 0 || file[0]?.size <= MAX_FILE_SIZE),
            `Tamanho máximo aceitado é 5MB`
        )
        .refine(
            (file) => !file || (file.length === 0 || ACCEPTED_IMAGE_TYPES.includes(file[0]?.type)),
            "Imagem deve ser .jpg, .jpeg, .png ou .webp"
        )
        .nullable()
        .optional(),
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

export const createWishlistItemButtonSchema = wishlistItemSchema.omit({
    description: true,
    price: true,
    image: true,
    link: true,
    priority: true,
    isActive: true,
    isPurchased: true,
    purchasedAt: true
});