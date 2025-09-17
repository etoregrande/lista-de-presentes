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
import {
  LoaderCircle as LoaderCircleIcon,
  Sparkles as SparklesIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { holdSecretSantaDrawAction } from '../actions'
import { useSecretSantaGroup } from '../context/context'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export const HoldSecretSantaDrawButton = () => {
  const pathname = usePathname()
  const [holdingDraw, setHoldingDraw] = useState(false)
  const { secretSantaGroup } = useSecretSantaGroup()
  const { id: groupId } = secretSantaGroup

  const onClick = async () => {
    setHoldingDraw(true)
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

    toast.success('Sorteio realizado com sucesso!', {
      description: 'Atualizando página...',
    })
    setTimeout(() => {
      window.location.href = pathname
    }, 1500)
  }

  return (
    <Credenza>
      <CredenzaTrigger asChild>
        <Button>
          <SparklesIcon />
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
          <Button onClick={onClick} variant="destructive" className="relative">
            <span className={holdingDraw ? 'invisible' : ''}>
              Realizar sorteio
            </span>
            {holdingDraw && (
              <LoaderCircleIcon className="absolute inset-0 m-auto animate-spin" />
            )}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
