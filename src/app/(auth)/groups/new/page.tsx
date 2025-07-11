import React from 'react'
import { getSessionOnServer } from '@/server/session'
import { Session } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Page() {
  const session: Session | null = await getSessionOnServer()

  if (!session) redirect('/login')

  return (
    <>
      <header className="layout-container flex justify-between py-10">
        <div className="grid w-full grid-cols-[auto_1fr] gap-4">
          <div className="aspect-square w-full rounded-md bg-amber-300"></div>
          <h1 className="truncate text-2xl font-bold">
            <span className="block text-base font-normal text-slate-500">
              Amigo secreto
            </span>
            Nome do grupo
          </h1>
        </div>
        <div className="flex w-full flex-col items-end">
          <p className="text-muted-foreground text-right">
            Evento dia <span className="font-bold">24/12</span>
          </p>
          <p className="text-right">
            Presentes até <span className="font-bold">R$100,00</span>
          </p>
        </div>
      </header>

      <main className="layout-container flex flex-col gap-10 md:flex-row"></main>
    </>
  )
}
