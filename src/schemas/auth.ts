import { z } from "zod";

export const signUpFormSchema = z.object({
    name:
        z.string()
            .min(2, { message: "Name must be at least 2 characters long" })
            .max(100, { message: "Name must be at most 100 characters long" })
            .trim()
            .regex(/^[A-Za-z\s'-]+$/, { message: "Formato de nome inválido" }),
    email:
        z.string()
            .email({ message: "Formato de email inválido" })
            .toLowerCase()
            .trim(),
    password:
        z.string()
            .min(8, { message: "Mínimo de 8 caracteres" }),
});

export const signInFormSchema = signUpFormSchema.omit({ name: true });