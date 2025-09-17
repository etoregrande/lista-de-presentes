'use client'

import { Button } from '@/components/ui/button'
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
import { ReactNode, useState } from 'react'
import { useSession } from '@/lib/context/session/context'
import { LoaderCircle as LoaderCircleIcon } from 'lucide-react'

interface GroupDeleteButtonProps {
  children: ReactNode
}
export const GroupDeleteButton = ({ children }: GroupDeleteButtonProps) => {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const { setGroups } = useSecretSantaGroups()
  const { secretSantaGroup } = useSecretSantaGroup()

  const { id: groupId } = secretSantaGroup
  const session = useSession()

  const onClick = async () => {
    setDeleting(true)
    const response = await deleteSecretSantaGroupAction(userId, groupId)

    if (response.success) {
      toast.success('Grupo deletado com sucesso!')
      setGroups((prev) => prev.filter((group) => group.id !== groupId))
      setDeleting(false)

      router.push('/wishlist')
    } else {
      setDeleting(false)
      console.error(response.error)
      toast.error('Erro ao deletar o grupo')
    }
  }

  if (!session) return null
  const { id: userId } = session.user

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
          <></>
        </CredenzaBody>
        <CredenzaFooter>
          <CredenzaClose asChild>
            <Button variant={'secondary'}>Cancelar</Button>
          </CredenzaClose>
          <Button onClick={onClick} variant="destructive" className="relative">
            <span className={deleting ? 'invisible' : ''}>Deletar grupo</span>
            {deleting && (
              <LoaderCircleIcon className="absolute inset-0 m-auto animate-spin" />
            )}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
