'use client'

import { Button } from '@/components/ui/button/button'
import { useRouter } from 'next/navigation'

export default function Home() {
    const router = useRouter()

    return (
        <div className="layout-container flex min-h-dvh items-center">
            <h1>Olá!</h1>
            <p className="text-slate-800">
                Se você chegou aqui é porque eu provavalmente pedi sua ajuda
                para testar essa aplicação. Ela está básica, muito feia e
                provavelmente bem quebrada, mas é exatamente por isso que
                preciso dos seus testes e sugestões!
            </p>
            <div className="flex flex-col gap-2">
                <Button
                    onClick={() => router.push('/signup')}
                    className="w-full self-center hover:underline"
                >
                    Não tem uma conta?
                </Button>
                <Button
                    onClick={() => router.push('/login')}
                    variant="secondary"
                    className="w-full self-center hover:underline"
                >
                    Já tenho cadastro
                </Button>
            </div>
        </div>
    )
}
