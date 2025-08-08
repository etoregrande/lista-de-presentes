'use client'

import { Button } from '@/components/ui/button/button'
import { SecretSantaGroup } from '@/generated/prisma'
import { useSecretSantaGroups } from '@/lib/context/secretSantaGroups/context'
import { useParams, useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import { toast } from 'sonner'

interface JoinGroupButton {
  children: ReactNode
  handleJoinGroup: () => Promise<{
    success: boolean
    secretSantaGroup: SecretSantaGroup
  }>
}

export const JoinGroupButton = ({
  children,
  handleJoinGroup,
}: JoinGroupButton) => {
  const { setGroups } = useSecretSantaGroups()
  const router = useRouter()
  const { slug } = useParams()

  const onClick = async () => {
    const response = await handleJoinGroup()

    if (response.success) {
      toast.success('Você entrou no grupo!')
      setGroups((prev) => [...prev, response.secretSantaGroup])

      router.push(`/groups/${slug}`)
    } else {
      toast.error('Erro ao entrar no grupo')
    }
  }

  return (
    <>
      <Button onClick={onClick}>{children}</Button>
    </>
  )
}
