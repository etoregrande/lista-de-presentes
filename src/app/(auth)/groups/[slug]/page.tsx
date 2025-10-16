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
import {
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  Trash as TrashIcon,
  Gift as GiftIcon,
} from 'lucide-react'
import { EditSecretSantaGroupSheet } from './ui/edit-secret-santa-group-sheet'
import { SecretSantaGroupProvider } from './context/provider'
import { ParticipantList } from './ui/participant/participant-list'
import { SecretSantaGroupBackground } from './ui/secret-santa-group-background'
import { ShareSecretSantaGroupButton } from './ui/share-secret-santa-group-button'
import { SecretSantaDrawResult } from './ui/secret-santa-draw-result'
import { SecretSantaGroupName } from './ui/secret-santa-group-name'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn, formatCurrencyFromCents } from '@/lib/utils'

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
  const { id: groupId, ownerId, eventDate, priceLimit } = group
  const isOwner = userId === ownerId
  const SecretSantaDrawReceiver = await getSecretSantaReceiver(userId, groupId)
  const participants = await listSecretSantaGroupParticipants(groupId)
  const formatedEventDate = eventDate
    ? format(eventDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null

  return (
    <SecretSantaGroupProvider
      secretSantaGroup={group}
      initialParticipants={participants}
      isOwner={isOwner}
    >
      <SecretSantaGroupBackground />
      <header className="layout-container flex w-full flex-col gap-4 pt-0 pb-10 md:pt-10">
        <section className="flex items-center">
          <div className="min-w-0 flex-1">
            <SecretSantaGroupName truncate={true} />
          </div>
          {isOwner && (
            <div className="flex flex-shrink-0 gap-2">
              <EditSecretSantaGroupSheet>
                <Button variant={'secondary'} size={'icontext'}>
                  <SettingsIcon />
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
                  <TrashIcon />
                  <span className="hidden md:inline">Abandonar grupo</span>
                </Button>
              </LeaveSecretSantaGroupButton>
            </div>
          )}
        </section>
        <section>
          <div className="flex gap-10">
            {eventDate && (
              <div className="flex gap-2">
                <CalendarIcon className="text-primary" />
                <p className="text-muted-foreground translate-y-[1px]">
                  {formatedEventDate}
                </p>
              </div>
            )}

            {priceLimit && (
              <div className="flex gap-2">
                <GiftIcon className="text-primary" />
                <p className="text-muted-foreground translate-y-[1px]">
                  Presentes até {formatCurrencyFromCents(priceLimit)}
                </p>
              </div>
            )}
          </div>
        </section>
      </header>
      <main className="layout-container pb-[60dvh] md:pb-0">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <article className="flex w-full flex-col gap-2 lg:w-2/3">
            <h2 className="text-lg font-bold">Quem eu tirei</h2>
            <div className="relative flex min-h-30 w-full items-center justify-center rounded-md md:min-h-40">
              <SecretSantaDrawResult receiver={SecretSantaDrawReceiver} />
            </div>
          </article>

          <article className="flex w-full min-w-[250px] flex-col gap-2 lg:w-1/3">
            <h2 className="text-lg font-bold">Participantes</h2>
            <div
              className={cn(
                'bg-background scrollable w-full space-y-2 overflow-x-hidden rounded-md',
                'md:shadow-[0_0_0_8px_theme(colors.background)] md:max-h-104 md:pr-2'
              )}
            >
              <ParticipantList />
            </div>
          </article>
        </div>
      </main>
    </SecretSantaGroupProvider>
  )
}
