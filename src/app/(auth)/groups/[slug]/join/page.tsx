import {
  getSecretSantaGroupInvitation,
  isSecretSantaGroupParticipant,
  createSecretSantaGroupParticipant,
} from '@/server/secretSantaGroup'
import { getSessionOnServer } from '@/server/session'
import { redirect } from 'next/navigation'
import { JoinGroupButton } from './ui/join-group-button'
import { Gift } from 'lucide-react'
import { SecretSantaGroupHeading } from '../ui/secret-santa-group-name'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const session = await getSessionOnServer()
  if (!session)
    redirect(`/login?callbackUrl=/groups/${encodeURIComponent(slug)}/join`)

  const isParticipant = await isSecretSantaGroupParticipant(slug)
  if (isParticipant) {
    redirect(`/groups/${slug}`)
  }

  const group = await getSecretSantaGroupInvitation(slug)

  async function handleJoinGroup() {
    'use server'
    return await createSecretSantaGroupParticipant(slug)
  }

  return (
    <>
      <main className="layout-container min-h-[calc(100dvh-200px)] py-8">
        {!group.isDrawn ? (
          <>
            <section className="surface-panel mx-auto flex h-full w-full max-w-3xl flex-col items-center p-6 md:justify-center md:p-10">
              <div className="mb-10 grid size-44 rotate-[-7deg] place-items-center rounded-[3rem] bg-[image:var(--gradient)] shadow-lg md:size-56">
                <Gift
                  className="text-primary size-24 md:size-32"
                  strokeWidth={1.3}
                  aria-hidden="true"
                />
              </div>

              <div className="flex w-full max-w-100 min-w-0 flex-col gap-4">
                <SecretSantaGroupHeading group={group} />
                <JoinGroupButton handleJoinGroup={handleJoinGroup}>
                  Entrar no grupo
                </JoinGroupButton>
              </div>
            </section>
          </>
        ) : (
          <p>Você não pode entrar num grupo que o sorteio já foi realizado!</p>
        )}
      </main>
    </>
  )
}
