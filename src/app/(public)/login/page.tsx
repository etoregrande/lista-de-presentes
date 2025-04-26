import { Gift } from 'lucide-react'
import { AuthWrapper } from './ui/Auth-wrapper'
import Image from 'next/image'

export default function Page() {
  return (
    <div className="bg-[image:var(--gradient)]">
      <div className="mx-auto flex min-h-dvh flex-col items-center justify-center px-2 sm:max-w-4xl sm:px-10">
        <div className="flex flex-col rounded-2xl bg-white shadow-2xl md:h-[600px] md:w-full md:flex-row">
          <div className="hidden w-full p-2 md:block md:w-1/2">
            <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-lg p-4">
              <Image
                src="/assets/login/home.jpg"
                alt="Tela de boas-vindas"
                fill
                priority
                className="z-0 object-cover object-center"
              />
              <div className="absolute inset-x-0 bottom-0 z-10 h-14 rounded-b-lg bg-gradient-to-t from-black/90 to-transparent md:h-60" />
              <div className="z-20 flex items-center gap-2">
                <Gift className="text-[var(--primary)]" />
                <p className="font-bold text-white">Presenteio</p>
              </div>
              <h1 className="z-20 hidden pr-10 text-2xl font-light tracking-tight text-white md:inline">
                Pra você parar de fingir que não quer ganhar presente!
              </h1>
            </div>
          </div>
          <div className="flex items-center p-8 md:w-1/2 md:px-14">
            <AuthWrapper className="" />
          </div>
        </div>
      </div>
    </div>
  )
}
