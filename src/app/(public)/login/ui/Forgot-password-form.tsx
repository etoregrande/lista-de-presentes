'use client'

import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { getUserByEmail } from "@/lib/repositories/UserRepository"
import { forgotPasswordFormSchema } from "@/schemas/auth"
import { ForgotPasswordFormData } from "@/types/auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { Dispatch, SetStateAction } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"

interface ForgotPasswordProps {
    setForgotPassword: Dispatch<SetStateAction<boolean>>
}

export const ForgotPasswordForm = ({ setForgotPassword }: ForgotPasswordProps) => {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting }
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordFormSchema)
    })

    const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (formData: ForgotPasswordFormData) => {
        const user = await getUserByEmail(formData.email)
        if (!user) {
            setError("email", { message: "Email não cadastrado" })
            return null
        }

        await authClient.forgetPassword({
            email: formData.email,
            redirectTo: '/reset-password'
        })

        toast.success(`Um link de recuperação foi enviado para ${formData.email}`)
    }

    return (
        <>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
            >
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        {...register("email")}
                        id="email"
                        type="email"
                    />
                    {errors.email && <div className="text-red-500">{errors.email.message}</div>}
                </div>
                <div className="flex flex-col gap-2">
                    <Button
                        disabled={isSubmitting}
                    >
                        {isSubmitting ?
                            <LoaderCircle className="animate-spin" />
                            :
                            "Enviar link de recuperação"
                        }
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setForgotPassword(false)}
                    >
                        Voltar
                    </Button>
                </div>
            </form >
        </>
    )
}