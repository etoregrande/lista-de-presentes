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
import { deleteSecretSantaGroupAction } from '../actions'
import { useSecretSantaGroup } from '../context/context'
import { ReactNode } from 'react'
import { useSession } from '@/lib/context/session/context'

interface GroupDeleteButtonProps {
  children: ReactNode
}
export const GroupDeleteButton = ({ children }: GroupDeleteButtonProps) => {
  const router = useRouter()
  const { setGroups } = useSecretSantaGroups()
  const { secretSantaGroup } = useSecretSantaGroup()

  const { id: groupId } = secretSantaGroup
  const session = useSession()

  const { id: userId } = session.user

  const onClick = async () => {
    const response = await deleteSecretSantaGroupAction(userId, groupId)

    if (response.success) {
      toast.success('Grupo deletado com sucesso!')
      setGroups((prev) => prev.filter((group) => group.id !== groupId))

      router.push('/wishlist')
    } else {
      console.error(response.error)
      toast.error('Erro ao deletar o grupo')
    }
  }

  return (
    <Credenza>
      <CredenzaTrigger asChild>{children}</CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Deletar grupo</CredenzaTitle>
          <CredenzaDescription>
            Você tem certeza que deseja deletar esse amigo secreto? Essa ação
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
            Deletar grupo
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
