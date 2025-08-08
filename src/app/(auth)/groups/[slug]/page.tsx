'use server'

import React from 'react'
import { getSessionOnServer } from '@/server/session'
import { redirect } from 'next/navigation'
import {
  getSecretSantaGroup,
  isSecretSantaGroupParticipant,
} from '@/server/secretSantaGroup'
import { ParticipantList } from './ui/participant/participant-list'
import { GroupDeleteButton } from './ui/group-delete-button'
import { GroupLeaveButton } from './ui/group-leave-button'
import { GroupHoldDrawButton } from './ui/group-hold-draw-button'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: PageProps) {
  const session = await getSessionOnServer()
  if (!session) redirect('/login')

  const { slug } = await params
  const isParticipant = await isSecretSantaGroupParticipant(
    slug,
    session.user.id
  )

  if (!isParticipant) {
    redirect('/wishlist')
  }

  const { id: userId } = session.user
  const {
    id: groupId,
    name: groupName,
    estimateDrawDate,
    priceLimit,
    ownerId,
  } = await getSecretSantaGroup(slug)
  const isOwner = userId === ownerId

  return (
    <>
      <header className="layout-container flex justify-between py-10">
        <div className="grid w-full grid-cols-[auto_1fr] gap-4">
          <div className="aspect-square w-full rounded-md bg-amber-300"></div>
          <h1 className="truncate text-2xl font-bold">
            <span className="block text-base font-normal text-slate-500">
              Amigo secreto
            </span>
            {groupName}
          </h1>
        </div>
        {isOwner ? (
          <>
            <GroupDeleteButton groupId={groupId} userId={userId} />
            <GroupHoldDrawButton groupId={groupId} />
          </>
        ) : (
          <GroupLeaveButton userId={userId} groupId={groupId} />
        )}
        <div className="flex w-full flex-col items-end">
          <p className="text-muted-foreground text-right">
            Evento dia{' '}
            <span className="font-bold">
              {estimateDrawDate
                ? new Date(estimateDrawDate).toLocaleDateString()
                : 'indefinido'}
            </span>
          </p>
          <p className="text-right">
            <span className="font-bold">
              {priceLimit
                ? `Presentes até R$${priceLimit / 100}`
                : 'sem valor definido'}
            </span>
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
              <ParticipantList groupId={groupId} />
            </div>
          </article>
        </section>
      </main>
    </>
  )
}
