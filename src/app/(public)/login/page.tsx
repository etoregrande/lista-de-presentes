'use client'

import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "@/server/users";
import { signInFormSchema } from "@/schemas/auth";
import { signInFormData } from "@/types/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";


export default function Page() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<signInFormData>(
        {
            // defaultValues: { email: "etore@test.com", password: "test1234" },
            resolver: zodResolver(signInFormSchema)
        }
    );

    const handlesignInUser: SubmitHandler<signInFormData> = async (data: signInFormData) => {
        try {
            const response = await signIn(data)

            if (response.code === 'INVALID_EMAIL_OR_PASSWORD') {
                setError('root', { message: 'Email ou senha inválidos' });
                return;
            }
            console.log(response)
            router.push('/')
        } catch (error: any) {
            throw new Error('Erro interno do servidor')
        }
    }

    return (
        <>
            <form
                onSubmit={handleSubmit(handlesignInUser)}
                className='flex flex-col space-y-4 justify-center px-4 h-screen max-w-sm mx-auto'
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
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                        {...register("password")}
                        id="password"
                        type="password"

                    />
                    {errors.password && <div className="text-red-500">{errors.password.message}</div>}
                </div>
                <Button disabled={isSubmitting}>
                    {isSubmitting ? 'Carregando...' : 'Entrar'}
                </Button>
                {errors.root && <div className="text-red-500">{errors.root.message}</div>}
                <Link
                    onClick={() => router.push('/signup')}
                    href='/signup'
                    className="w-auto self-center hover:underline"
                >
                    Não tem uma conta?
                </Link>
            </form>
        </>
    )
}