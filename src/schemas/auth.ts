import { z } from "zod";

export const signUpFormSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Mínimo 2 caracteres" })
        .max(100, { message: "Nome muito grande" })
        .trim()
        .regex(/^[A-Za-z\s'-]+$/, { message: "Formato de nome inválido" }),
    email: z
        .string()
        .email({ message: "Email inválido" })
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(8, { message: "Mínimo de 8 caracteres" }),
});

export const signInFormSchema = signUpFormSchema.omit({ name: true });