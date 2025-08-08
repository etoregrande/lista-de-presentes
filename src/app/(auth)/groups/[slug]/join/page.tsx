import {
  getSecretSantaGroup,
  isSecretSantaGroupParticipant,
  createSecretSantaGroupParticipant,
} from '@/server/secretSantaGroup'
import { getSessionOnServer } from '@/server/session'
import { redirect } from 'next/navigation'
import { JoinGroupButton } from './ui/join-group-button'

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
    <>
      <main className="layout-container flex flex-col gap-10 md:flex-row">
        <section className="flex w-full flex-col gap-10 md:w-2/3">
          <article className="grid w-full gap-2">
            <h2 className="text-lg font-bold">{slug}</h2>
            <JoinGroupButton handleJoinGroup={handleJoinGroup}>
              Entrar no grupo
            </JoinGroupButton>
          </article>
        </section>
      </main>
    </>
  )
}
