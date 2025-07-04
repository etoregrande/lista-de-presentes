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
          <h1 className="text-2xl font-bold">
            <span className="block text-base font-normal text-slate-500">
              Amigo secreto
            </span>
            Nome do grupo
          </h1>
        </div>
        <div className="flex w-full flex-col items-end">
          <p className="text-muted-foreground">
            Evento dia <span className="font-bold">24/12</span>
          </p>
          <p>
            Presentes até <span className="font-bold">R$100,00</span>
          </p>
        </div>
      </header>

      <main className="layout-container flex flex-col gap-10 md:flex-row">
        <section className="flex w-full flex-col gap-10 md:w-2/3">
          <article className="grid w-full gap-2">
            <h2 className="text-lg font-bold">Quem eu tirei</h2>
            <div className="bg-muted flex min-h-40 w-full items-center justify-center rounded-md">
              <p>O sorteio ainda não foi realizado!</p>
            </div>
          </article>
          <article className="grid w-full gap-2">
            <h2 className="text-lg font-bold">Minha lista de presentes</h2>
            <div className="bg-muted flex min-h-40 w-full items-center justify-center rounded-md">
              <p>Lista de presentes vazia</p>
            </div>
          </article>
        </section>
        <section className="w-full md:w-1/3">
          <article className="grid w-full gap-2">
            <h2 className="text-lg font-bold">Participantes</h2>
            <div className="bg-muted flex min-h-40 w-full items-center justify-center rounded-md">
              <p>N/A</p>
            </div>
          </article>
        </section>
      </main>
    </>
  )
}
