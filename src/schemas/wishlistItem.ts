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
            (files) => files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files.item(0)!.type),
            { message: "Imagem deve ser .jpg, .jpeg, .png ou .webp" }
        )
        .refine(
            (files) => files.length === 0 || files.item(0)!.size <= MAX_FILE_SIZE,
            { message: "Tamanho máximo aceitado é 5MB" }
        )
        .nullable()
        .optional(),
    link: z
        .string()
        .nullable()
        .transform((val) => {
            if (!val) return val
            return val.startsWith('http://') || val.startsWith('https://') ? val : `https://${val}`
        }),
    priority: z
        .string()
        .refine(value => ['alta', 'normal', 'baixa'].includes(value), {
            message: 'Prioridade deve ser "alta", "normal", or "baixa"',
        })
        .default('normal'),
    isPurchased: z
        .boolean()
        .nullable(),
    purchasedAt: z
        .date()
        .nullable(),
    isActive: z
        .boolean()
});


export const createWishlistItemFormSchema = wishlistItemSchema.omit({
    description: true,
    price: true,
    image: true,
    priority: true,
    isPurchased: true,
    purchasedAt: true,
    isActive: true,
    link: true
});

export const editWishlistItemFormSchema = wishlistItemSchema.omit({
    isPurchased: true,
    purchasedAt: true
})