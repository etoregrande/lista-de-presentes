import { Gift } from 'lucide-react'
import { LoginWrapper } from './ui/Login-wrapper'

export default function Page() {
  return (
    <div className="bg-[image:var(--gradient)]">
      <div className="mx-auto flex min-h-dvh flex-col items-center justify-center px-2 sm:max-w-4xl sm:px-10">
        <div className="flex w-sm flex-col rounded-2xl bg-white md:h-[600px] md:w-full md:flex-row">
          <div className="hidden w-full p-2 md:block md:w-1/2">
            <div className="flex h-full w-full flex-col justify-between rounded-lg bg-[image:var(--gradient)] bg-cover bg-center p-4">
              <div className="flex items-center gap-2">
                <Gift className="text-[var(--primary)]" />
                <p className="font-bold text-[var(--primary)]">Presenteio</p>
              </div>
              <h1 className="pr-10 text-2xl font-bold text-[var(--primary)]">
                Pra você parar de fingir que não quer presente!
              </h1>
            </div>
          </div>
          <div className="flex items-center p-8 md:w-1/2 md:px-14">
            <LoginWrapper className="" />
          </div>
        </div>
      </div>
    </div>
  )
}
