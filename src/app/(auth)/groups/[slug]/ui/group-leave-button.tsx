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

interface GroupLeaveButtonProps {
  handleLeave: () => Promise<
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

export const GroupLeaveButton = ({
  handleLeave,
  groupId,
}: GroupLeaveButtonProps) => {
  const { setGroups } = useSecretSantaGroups()
  const router = useRouter()

  const onClick = async () => {
    const response = await handleLeave()

    if (response.success) {
      toast.success('Você saiu do amigo secreto')
      setGroups((prev) => prev.filter((group) => group.id !== groupId))

      router.push('/wishlist')
    } else {
      console.error(response.error)
      toast.error('Erro ao abandonar o grupo')
    }
  }

  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button variant={'destructive'}>
          <Trash />
          Abandonar grupo
        </Button>
      </CredenzaTrigger>
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
