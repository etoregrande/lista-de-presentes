import { signInFormSchema, signUpFormSchema } from "@/schemas/auth";
import { z } from "zod";

export type SignUpFormData = z.infer<typeof signUpFormSchema>;
export type SignInFormData = z.infer<typeof signInFormSchema>;
