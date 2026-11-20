import React from 'react'

export default async function Page() {
  return (
    <>
      <header className="layout-container flex justify-between py-10">
        <div className="surface-panel flex w-full justify-between gap-5 bg-[image:var(--gradient)] p-6 md:p-10">
          <div className="grid w-full grid-cols-[auto_1fr] gap-4">
            <div
              className="bg-accent text-primary grid size-16 place-items-center rounded-2xl"
              aria-hidden="true"
            >
              ✦
            </div>
            <h1 className="truncate text-2xl font-bold">
              <span className="text-muted-foreground block text-base font-normal">
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
        </div>
      </header>

      <main className="layout-container flex flex-col gap-10 md:flex-row"></main>
    </>
  )
}
