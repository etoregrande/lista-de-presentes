import {
  getSecretSantaGroup,
  isSecretSantaGroupParticipant,
  createSecretSantaGroupParticipant,
} from '@/server/secretSantaGroup'
import { getSessionOnServer } from '@/server/session'
import { redirect } from 'next/navigation'
import { JoinGroupButton } from './ui/join-group-button'
import Image from 'next/image'
import { SecretSantaGroupName } from '../ui/secret-santa-group-name'
import { SecretSantaGroupProvider } from '../context/provider'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const session = await getSessionOnServer()
  if (!session)
    redirect(`/login?callbackUrl=/groups/${encodeURIComponent(slug)}/join`)

  const isParticipant = await isSecretSantaGroupParticipant(
    slug,
    session.user.id
  )
  if (isParticipant) {
    redirect(`/groups/${slug}`)
  }

  const group = await getSecretSantaGroup(slug)

  async function handleJoinGroup() {
    'use server'
    return await createSecretSantaGroupParticipant(session!.user.id, group.id)
  }

  return (
    <SecretSantaGroupProvider
      secretSantaGroup={group}
      isOwner={false}
      initialParticipants={[]}
    >
      <main className="layout-container min-h-[calc(100vh-200px)]">
        {!group.isDrawn ? (
          <>
            <section className="flex h-full w-full flex-col items-center md:justify-center">
              <Image
                src="/assets/secretSanta/joinSecretSanta.svg"
                alt="Join Secret Santa"
                width={400}
                height={400}
                className="max-h-full max-w-full object-contain"
                priority
              />

              <div className="flex w-full max-w-100 min-w-0 flex-col gap-4">
                <SecretSantaGroupName />
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
    </SecretSantaGroupProvider>
  )
}
