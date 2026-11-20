import { Gift, LoaderCircle } from 'lucide-react'
import Image from 'next/image'
import { AuthWrapper } from './ui/Auth-wrapper'
import { Suspense } from 'react'

export default function Page() {
  return (
    <div className="bg-background relative isolate min-h-dvh overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[65dvh] bg-[image:var(--gradient)]" />
      <div className="mx-auto flex min-h-dvh max-w-6xl items-center px-5 py-24 md:px-10">
        <div className="surface-panel grid w-full overflow-hidden md:min-h-[640px] md:grid-cols-[1.05fr_1fr]">
          <div className="relative h-36 overflow-hidden md:hidden">
            <Image
              src="/assets/login/home.jpg"
              alt="Presentes embrulhados"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_60%]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#17312d]/80 via-[#17312d]/30 to-transparent" />
            <p className="relative p-6 text-lg font-bold text-white">
              Presenteio
            </p>
          </div>
          <div className="relative hidden overflow-hidden bg-[image:var(--gradient)] p-10 md:flex md:flex-col md:justify-between">
            <Image
              src="/assets/login/home.jpg"
              alt="Presentes embrulhados"
              fill
              priority
              sizes="(max-width: 768px) 0px, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a302d]/50 via-[#1a302d]/15 to-[#152d2a]/80" />
            <div className="absolute -top-24 -right-28 size-96 rounded-full border-[70px] border-white/10" />
            <div className="relative flex items-center gap-3">
              <span className="bg-card text-primary rounded-2xl p-3 shadow-lg">
                <Gift className="size-7" />
              </span>
              <p className="text-xl font-black tracking-tight text-white">
                Presenteio
              </p>
            </div>
            <div className="relative">
              <h1 className="max-w-md text-4xl leading-tight font-black tracking-tight text-white drop-shadow-md">
                Pra você parar de fingir que não quer ganhar presente!
              </h1>
            </div>
          </div>
          <div className="flex items-center p-7 md:min-h-[520px] md:px-16 md:py-12">
            <Suspense fallback={<LoaderCircle className="animate-spin pr-1" />}>
              <AuthWrapper />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
