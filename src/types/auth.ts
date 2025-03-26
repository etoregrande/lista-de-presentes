import { signInFormSchema, signUpFormSchema } from "@/schemas/auth";
import { z } from "zod";

export type SignUpFormData = z.infer<typeof signUpFormSchema>;
export type signInFormData = z.infer<typeof signInFormSchema>;
