import { Dispatch, SetStateAction, useEffect } from 'react'
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from '@/components/ui/credenza'
import { NavbarNewSecretSantaGroupForm } from './navbar-new-secret-santa-group-form'
import { Button } from '../button/button'
import { FormProvider, useForm } from 'react-hook-form'
import { secretSantaGroupFormData } from '@/types/secretSantaGroup'
import { zodResolver } from '@hookform/resolvers/zod'
import { secretSantaGroupFormSchema } from '@/schemas/secretSantaGroup'
import { createSecretSantaGroup } from '@/server/secretSantaGroup'
import { authClient } from '@/lib/auth-client'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'

interface NavbarNewGroupModalProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

export const NavbarNewSecretSantaGroupModal = ({
  isOpen,
  setIsOpen,
}: NavbarNewGroupModalProps) => {
  const form = useForm<secretSantaGroupFormData>({
    resolver: zodResolver(secretSantaGroupFormSchema),
  })
  const { handleSubmit, reset } = form

  const onSubmit = async (data: secretSantaGroupFormData) => {
    console.log('Form submitted:', data)
    const { data: session } = await authClient.getSession()
    if (!session) redirect('/login')

    const newSecretSantaGroup = await createSecretSantaGroup(
      data,
      session.user.id
    )

    if (!newSecretSantaGroup) {
      return toast.error('Erro ao criar novo grupo')
    }

    setIsOpen(false)
    reset()
    toast.success('Grupo criado com sucesso!')
    console.log('New Secret Santa Group created:', newSecretSantaGroup)
  }

  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  return (
    <>
      <Credenza open={isOpen} onOpenChange={setIsOpen}>
        <CredenzaContent className="md:w-90">
          <CredenzaHeader>
            <CredenzaTitle>Novo amigo secreto</CredenzaTitle>
            <CredenzaDescription>
              Dê um nome para o novo grupo
            </CredenzaDescription>
          </CredenzaHeader>
          <CredenzaBody className="md:overflow-visible">
            <FormProvider {...form}>
              <NavbarNewSecretSantaGroupForm />
            </FormProvider>
          </CredenzaBody>
          <CredenzaFooter className="flex flex-col gap-2 md:flex-row">
            <Button
              onClick={() => setIsOpen(false)}
              variant="secondary"
              className="block flex-1 md:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              className="block flex-1 md:w-auto"
            >
              Criar grupo
            </Button>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>
    </>
  )
}
