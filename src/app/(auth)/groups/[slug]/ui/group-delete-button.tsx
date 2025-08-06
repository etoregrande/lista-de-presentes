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
import { Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface GroupDeleteButtonProps {
  handleDelete: () => Promise<
    | {
        success: boolean
        error: string
      }
    | {
        success: boolean
        error?: undefined
      }
  >
  groupId: string
}

export const GroupDeleteButton = ({
  handleDelete,
  groupId,
}: GroupDeleteButtonProps) => {
  const { setGroups } = useSecretSantaGroups()
  const router = useRouter()

  const onClick = async () => {
    const response = await handleDelete()

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
      <CredenzaTrigger asChild>
        <Button variant={'destructive'}>
          <Trash />
          Deletar grupo
        </Button>
      </CredenzaTrigger>
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
