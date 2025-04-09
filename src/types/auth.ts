import { forgotPasswordFormSchema, resetPasswordFormSchema, signInFormSchema, signUpFormSchema } from "@/schemas/auth";
import { z } from "zod";

export type SignUpFormData = z.infer<typeof signUpFormSchema>;
export type SignInFormData = z.infer<typeof signInFormSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;
