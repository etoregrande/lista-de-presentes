'use client'

import { Button } from '@/components/ui/button/button'
import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from '@/components/ui/credenza'
import { useSecretSantaGroups } from '@/lib/context/secretSantaGroups/context'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { leaveSecretSantaGroupAction } from '../actions'
import { useSecretSantaGroup } from '../context/context'
import { useSession } from '@/lib/context/session/context'
import { ReactNode } from 'react'

interface LeaveSecretSantaGroupButtonProps {
  children: ReactNode
}

export const LeaveSecretSantaGroupButton = ({
  children,
}: LeaveSecretSantaGroupButtonProps) => {
  const { setGroups } = useSecretSantaGroups()
  const { secretSantaGroup } = useSecretSantaGroup()
  const { user } = useSession()
  const { id: groupId } = secretSantaGroup
  const { id: userId } = user

  const router = useRouter()

  const onClick = async () => {
    const response = await leaveSecretSantaGroupAction(userId, groupId)

    if (!response.success) {
      toast.error('Erro ao abandonar o grupo')
      return
    }

    toast.success('Você saiu do amigo secreto')
    setGroups((prev) => prev.filter((group) => group.id !== groupId))

    router.push('/wishlist')
  }

  return (
    <Credenza>
      <CredenzaTrigger asChild>{children}</CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Sair do grupo</CredenzaTitle>
          <CredenzaDescription>
            Você tem certeza que deseja sair desse amigo secreto? Essa ação
            <span className="text-primary font-bold">
              {' '}
              não poderá ser desfeita!
            </span>
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody>
          <p></p>
        </CredenzaBody>
        <CredenzaFooter>
          <CredenzaClose asChild>
            <Button variant={'secondary'}>Cancelar</Button>
          </CredenzaClose>
          <Button onClick={onClick} variant="destructive">
            Abandonar grupo
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
