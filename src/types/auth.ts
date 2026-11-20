import { signInFormSchema, otpFormSchema, completeProfileSchema } from '@/schemas/auth'
import { z } from "zod";

export type SignInFormData = z.infer<typeof signInFormSchema>;
export type OtpFormData = z.infer<typeof otpFormSchema>;
export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;
