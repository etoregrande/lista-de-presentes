'use server'

import React from 'react'
import { getSessionOnServer } from '@/server/session'
import { redirect } from 'next/navigation'
import {
  getSecretSantaGroup,
  isSecretSantaGroupParticipant,
  listSecretSantaGroupParticipants,
} from '@/server/secretSantaGroup'
import { LeaveSecretSantaGroupButton } from './ui/leave-secret-santa-group-button'
import { getSecretSantaReceiver } from '@/server/secretSantaDraw'
import { Button } from '@/components/ui/button/button'
import { Settings, Trash } from 'lucide-react'
import { EditSecretSantaGroupSheet } from './ui/edit-secret-santa-group-sheet'
import { SecretSantaGroupProvider } from './context/provider'
import { ParticipantList } from './ui/participant/participant-list'
import { SecretSantaGroupBackground } from './ui/secret-santa-group-background'
import { ShareSecretSantaGroupButton } from './ui/share-secret-santa-group-button'
import { SecretSantaDrawResult } from './ui/secret-santa-draw-result'

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
  const SecretSantaDrawReceiver = await getSecretSantaReceiver(userId, groupId)
  const participants = await listSecretSantaGroupParticipants(groupId)

  return (
    <SecretSantaGroupProvider
      secretSantaGroup={group}
      initialParticipants={participants}
      isOwner={isOwner}
    >
      <SecretSantaGroupBackground />
      <header className="layout-container flex pt-0 pb-10 md:pt-10">
        <div className="grid w-full grid-cols-[auto_1fr] gap-4">
          <div className="aspect-square w-full rounded-md bg-amber-300"></div>
          <h1 className="truncate text-2xl font-bold">
            <span className="block text-base font-normal text-slate-500">
              Amigo secreto
            </span>
            {groupName}
          </h1>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <EditSecretSantaGroupSheet>
              <Button variant={'secondary'} size={'icontext'}>
                <Settings />
                <span className="hidden md:inline">Editar grupo</span>
              </Button>
            </EditSecretSantaGroupSheet>
            <ShareSecretSantaGroupButton />
          </div>
        )}
        {!isOwner && (
          <LeaveSecretSantaGroupButton>
            <Button variant={'destructive'} size={'icontext'}>
              <Trash />
              <span className="hidden md:inline">Abandonar grupo</span>
            </Button>
          </LeaveSecretSantaGroupButton>
        )}
      </header>

      <main className="layout-container flex flex-col gap-10 md:flex-row">
        <section className="flex w-full flex-col gap-10 md:w-2/3">
          <article className="grid w-full gap-2">
            <h2 className="text-lg font-bold">Quem eu tirei</h2>
            <div className="bg-muted flex min-h-40 w-full items-center justify-center rounded-md">
              <SecretSantaDrawResult receiver={SecretSantaDrawReceiver} />
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
            <div className="flex w-full flex-col justify-center gap-2 overflow-hidden rounded-md">
              <ParticipantList />
            </div>
          </article>
        </section>
      </main>
    </SecretSantaGroupProvider>
  )
}
