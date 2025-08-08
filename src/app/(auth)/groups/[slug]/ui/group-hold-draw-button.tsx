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
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { holdSecretSantaDrawAction } from '../actions'

interface GroupHoldDrawButtonProps {
  groupId: string
}

export const GroupHoldDrawButton = ({ groupId }: GroupHoldDrawButtonProps) => {
  const onClick = async () => {
    const response = await holdSecretSantaDrawAction(groupId)

    if (
      response.error === 'At least 4 participants are needed to hold a draw'
    ) {
      toast.warning(
        'Você precisa de pelo menos 4 pessoas para realizar o sorteio'
      )
      console.error('Failed to hold draw:', response.error)
      return
    }

    if (!response.success) {
      toast.error(response.error || 'Erro ao realizar o sorteio')
      console.error('Failed to hold draw:', response.error)
      return
    }

    toast.success('Sorteio realizado com sucesso!')
  }

  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button>
          <Sparkles />
          Realizar sorteio
        </Button>
      </CredenzaTrigger>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Realizar sorteio</CredenzaTitle>
          <CredenzaDescription>
            Você tem certeza que deseja realizar o sorteio? Depois disso
            <span className="text-primary font-bold">
              {' '}
              ninguém mais poderá entrar no grupo!
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
          <Button onClick={onClick}>Realizar sorteio!</Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
