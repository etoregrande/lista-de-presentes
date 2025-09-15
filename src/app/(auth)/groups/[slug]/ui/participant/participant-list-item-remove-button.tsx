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
import { ReactNode, useState } from 'react'
import { useSecretSantaGroup } from '../../context/context'
import { toast } from 'sonner'
import { leaveSecretSantaGroupAction } from '../../actions'

interface ParticipantListItemRemoveButtonProps {
  children: ReactNode
  participantId: string
}

export const ParticipantListItemRemoveButton = ({
  children,
  participantId,
}: ParticipantListItemRemoveButtonProps) => {
  const { setParticipants } = useSecretSantaGroup()
  const { secretSantaGroup } = useSecretSantaGroup()
  const [isOpen, setIsOpen] = useState(false)

  const onClick = async () => {
    const response = await leaveSecretSantaGroupAction(
      participantId,
      secretSantaGroup.id
    )

    if (response.success) {
      toast.success('Participante removido com sucesso!')
      setParticipants((prev) =>
        prev.filter((participant) => participant.id !== participantId)
      )
      setIsOpen(false)
    } else {
      toast.error('Erro ao remover participante')
    }
  }

  return (
    <Credenza open={isOpen} onOpenChange={setIsOpen}>
      <CredenzaTrigger asChild>{children}</CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Remover participante</CredenzaTitle>
          <CredenzaDescription>
            Você tem certeza que deseja remover esse participante?
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
            Remover
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
