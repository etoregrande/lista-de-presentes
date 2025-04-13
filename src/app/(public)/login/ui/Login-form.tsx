'use client'

import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInFormSchema } from "@/schemas/auth";
import { signIn } from "@/server/auth";
import { SignInFormData } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface LoginFormProps {
    setForgotPassword: Dispatch<SetStateAction<boolean>>
}

export const LoginForm = ({ setForgotPassword }: LoginFormProps) => {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInFormSchema)
    });

    const handlesignInUser: SubmitHandler<SignInFormData> = async (data: SignInFormData) => {
        try {
            const response = await signIn(data)

            if (response.code === 'INVALID_EMAIL_OR_PASSWORD') {
                setError('root', { message: 'Email ou senha inválidos' });
                return;
            }

            router.push('/')
        } catch (error: any) {
            throw new Error('Erro interno do servidor')
        }
    }


    return (
        <form
            onSubmit={handleSubmit(handlesignInUser)}
            className="flex flex-col gap-4"
        >
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                    {...register("email")}
                    id="email"
                    type="email"
                />
            </div>
            {errors.email && <div className="text-red-500">{errors.email.message}</div>}
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                    {...register("password")}
                    id="password"
                    type="password"

                />
                {errors.password && <div className="text-red-500">{errors.password.message}</div>}
                {errors.root && <div className="text-red-500">{errors.root.message}</div>}
            </div>
            <Button disabled={isSubmitting}>
                {isSubmitting ?
                    <LoaderCircle className="animate-spin" />
                    :
                    'Entrar'
                }
            </Button>
            <Button
                onClick={() => setForgotPassword(true)}
                type="button"
            >
                Esqueci minha senha
            </Button>
            <Link
                onClick={() => router.push('/signup')}
                href='/signup'
                className="w-auto self-center hover:underline"
            >
                Não tem uma conta?
            </Link>
        </form>
    )
}