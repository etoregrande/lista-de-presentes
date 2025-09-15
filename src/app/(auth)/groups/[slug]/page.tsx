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
import { Button } from '@/components/ui/button'
import { Settings, Trash } from 'lucide-react'
import { EditSecretSantaGroupSheet } from './ui/edit-secret-santa-group-sheet'
import { SecretSantaGroupProvider } from './context/provider'
import { ParticipantList } from './ui/participant/participant-list'
import { SecretSantaGroupBackground } from './ui/secret-santa-group-background'
import { ShareSecretSantaGroupButton } from './ui/share-secret-santa-group-button'
import { SecretSantaDrawResult } from './ui/secret-santa-draw-result'
import { SecretSantaGroupName } from './ui/secret-santa-group-name'

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
  const { id: groupId, ownerId } = group
  const isOwner = userId === ownerId
  const SecretSantaDrawReceiver = await getSecretSantaReceiver(userId, groupId)
  const participants = await listSecretSantaGroupParticipants(groupId)
  // const wishlist = await listWishlistItems(userId, {
  //   ...(group.priceLimit && { maxPrice: group.priceLimit }),
  // })

  return (
    <SecretSantaGroupProvider
      secretSantaGroup={group}
      initialParticipants={participants}
      isOwner={isOwner}
    >
      <SecretSantaGroupBackground />
      <header className="layout-container flex w-full items-center gap-8 pt-0 pb-10 md:pt-10">
        <div className="min-w-0 flex-1">
          <SecretSantaGroupName truncate={true} />
        </div>
        {isOwner && (
          <div className="flex flex-shrink-0 gap-2">
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
          <div className="flex-shrink-0">
            <LeaveSecretSantaGroupButton>
              <Button variant={'destructive'} size={'icontext'}>
                <Trash />
                <span className="hidden md:inline">Abandonar grupo</span>
              </Button>
            </LeaveSecretSantaGroupButton>
          </div>
        )}
      </header>

      <main className="layout-container flex flex-col gap-10 pb-[60dvh] md:pb-0">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
          <article className="flex min-h-10 w-full flex-col gap-2">
            <h2 className="text-lg font-bold">Quem eu tirei</h2>
            <div className="relative flex min-h-40 w-full items-center justify-center rounded-md">
              <SecretSantaDrawResult receiver={SecretSantaDrawReceiver} />
            </div>
          </article>
          <article className="row-span-2 flex min-h-10 w-full flex-col gap-2">
            <h2 className="text-lg font-bold">Participantes</h2>
            <div className="flex w-full flex-col justify-center gap-2 overflow-hidden rounded-md">
              <ParticipantList />
            </div>
          </article>
          {/* <article className="flex min-h-10 w-full flex-col gap-2">
            <h2 className="text-lg font-bold">Minha lista de presentes</h2>
           <EmptyWishlist isEmpty={true} /> 
            <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
              <SecretSantaWishlist items={wishlist} maxItems={8} />
            </div>
          </article> */}
        </div>
      </main>
    </SecretSantaGroupProvider>
  )
}
