'use client'

import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signUp } from "@/server/auth";
import { SignUpFormData } from "@/types/auth";
import { signUpFormSchema } from "@/schemas/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Page() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormData>(
        {
            // defaultValues: { name: "etore", email: "etore@test.com", password: "test1234" },
            resolver: zodResolver(signUpFormSchema)
        }
    );

    const handleSignUp: SubmitHandler<SignUpFormData> = async (data: SignUpFormData) => {
        try {
            const response = await signUp(data)

            if (response.code === "USER_ALREADY_EXISTS") {
                setError('email', { message: 'Email já cadastrado' });
                return;
            }

            router.push('/wishlist')
        } catch (error: any) {
            throw new Error('Erro interno do servidor')
        }
    }

    return (
        <div className="flex flex-col space-y-4 justify-center px-4 h-screen max-w-sm mx-auto">
            <h1 className="text-center">Cadastrar</h1>
            <form
                onSubmit={handleSubmit(handleSignUp)}
                className='flex flex-col gap-4 bg-white p-8 shadow-2xl rounded-sm'
            >
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                        {...register("name")}
                        id="name"
                    />
                    {errors.name && <div className="text-red-500">{errors.name.message}</div>}
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        {...register("email")}
                        id="email"
                        type="email"
                    />
                    {errors.email && <div className="text-red-500">{errors.email.message}</div>}
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                        {...register("password")}
                        id="password"
                        type="password"

                    />
                    {errors.password && <div className="text-red-500">{errors.password.message}</div>}
                </div>
                <Button disabled={isSubmitting} className="grid w-full max-w-sm">
                    {isSubmitting ? 'Carregando...' : 'Cadastrar'}
                </Button>
                <Link
                    onClick={() => router.push('/login')}
                    href='/login'
                    className="w-auto self-center hover:underline"
                >
                    Já tenho cadastro
                </Link>
            </form >
        </div>
    )
}