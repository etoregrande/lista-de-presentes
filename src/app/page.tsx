import { Button } from '@/components/ui/button/button'
import { Gift, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-[image:var(--gradient)]">
      <div className="layout-container flex min-h-dvh flex-col justify-center gap-4 px-4 md:items-center md:gap-10 lg:px-0">
        <div className="flex flex-col items-center">
          <Gift className="text-foregroudn h-40 w-40" />
          <h1 className="text-[var(--foreground)]t text-center text-6xl font-bold tracking-tighter md:text-8xl">
            Presenteio
            <span className="block text-center text-lg font-light tracking-tight text-black md:text-left md:text-2xl">
              Pra você parar de fingir que não quer presente!
            </span>
          </h1>
        </div>
        <Button
          asChild
          size="lg"
          className="flex w-full gap-2 hover:gap-4 md:w-auto md:text-base"
        >
          <Link href="/login">
            Vamos começar
            <LogIn />
          </Link>
        </Button>
      </div>
    </div>
  )
}
