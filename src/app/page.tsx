'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col space-y-4 justify-center px-4 h-screen max-w-sm mx-auto">
      <Link
        onClick={() => router.push('/signup')}
        href='/signup'
        className="w-auto self-center hover:underline"
      >
        Não tem uma conta?
      </Link>
      <Link
        onClick={() => router.push('/login')}
        href='/login'
        className="w-auto self-center hover:underline"
      >
        Já tenho cadastro
      </Link>
    </div>
  )
}
