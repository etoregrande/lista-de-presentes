'use server'

import React from 'react'
import { getSessionOnServer } from '@/server/session'
import { redirect } from 'next/navigation'
import {
  getSecretSantaGroup,
  isSecretSantaGroupParticipant,
  listSecretSantaGroupParticipants,
} from '@/server/secretSantaGroup'
import { GroupLeaveButton } from './ui/group-leave-button'
import { DrawResult } from './ui/draw-result'
import {
  getSecretSantaReceiver,
  listSecretSantaReceivers,
} from '@/server/secretSantaDraw'
import { TempDrawList } from './ui/participant/temp-draw-list'
import { GroupDatePicker } from './ui/group-date-picker'
import { Button } from '@/components/ui/button/button'
import { Settings } from 'lucide-react'
import { GroupEditSheet } from './ui/group-edit-sheet'
import { SecretSantaGroupProvider } from './context/provider'
import { ParticipantList } from './ui/participant/participant-list'
import { SessionProvider } from '@/lib/context/session/provider'

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
  const group = await getSecretSantaGroup(slug)
  const { id: groupId, name: groupName, ownerId } = group
  const isOwner = userId === ownerId
  const drawResult = await getSecretSantaReceiver(userId, groupId)
  const receiverList = await listSecretSantaReceivers(groupId)
  const participants = await listSecretSantaGroupParticipants(groupId)

  return (
    <SessionProvider session={session}>
      <SecretSantaGroupProvider
        secretSantaGroup={group}
        participants={participants}
      >
        <header className="layout-container flex justify-between py-10">
          <div className="grid w-full grid-cols-[auto_1fr] gap-4">
            <div className="aspect-square w-full rounded-md bg-amber-300"></div>
            <h1 className="truncate text-2xl font-bold">
              <span className="block text-base font-normal text-slate-500">
                Amigo secreto
              </span>
              {groupName}
            </h1>{' '}
          </div>
          {isOwner && (
            <GroupEditSheet>
              <Button variant={'secondary'} size={'icon'} className="self-end">
                <Settings />
              </Button>
            </GroupEditSheet>
          )}
          {!isOwner && <GroupLeaveButton />}
          <div className="flex w-full flex-col items-end">
            <GroupDatePicker />
          </div>
        </header>

        <main className="layout-container flex flex-col gap-10 md:flex-row">
          <section className="flex w-full flex-col gap-10 md:w-2/3">
            <article className="grid w-full gap-2">
              <h2 className="text-lg font-bold">Quem eu tirei</h2>
              <div className="bg-muted flex min-h-40 w-full items-center justify-center rounded-md">
                <DrawResult receiver={drawResult} />
              </div>
            </article>
            <article className="grid w-full gap-2">
              <h2 className="text-lg font-bold">Minha lista de presentes</h2>
              <div className="bg-muted flex min-h-40 w-full items-center justify-center rounded-md">
                <p>Lista de presentes vazia</p>
              </div>
            </article>
            <article className="grid w-full gap-2">
              <h2 className="text-lg font-bold">
                Resultados do sorteio (Somente dev)
              </h2>
              <div className="bg-muted flex min-h-40 w-full flex-col items-center justify-center rounded-md">
                <TempDrawList receiverList={receiverList} />
              </div>
            </article>
          </section>
          <section className="w-full md:w-1/3">
            <article className="grid w-full gap-2">
              <h2 className="text-lg font-bold">Participantes</h2>
              <div className="flex w-full flex-col justify-center gap-2 overflow-hidden rounded-md">
                <ParticipantList />
              </div>
            </article>
          </section>
        </main>
      </SecretSantaGroupProvider>
    </SessionProvider>
  )
}
