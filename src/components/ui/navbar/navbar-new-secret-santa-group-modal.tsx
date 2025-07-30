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
import { redirect, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LoaderCircle } from 'lucide-react'
import { SecretSantaGroup } from '@/generated/prisma'

interface NavbarNewGroupModalProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  setGroups: Dispatch<SetStateAction<SecretSantaGroup[]>>
}

export const NavbarNewSecretSantaGroupModal = ({
  isOpen,
  setIsOpen,
  setGroups,
}: NavbarNewGroupModalProps) => {
  const form = useForm<secretSantaGroupFormData>({
    resolver: zodResolver(secretSantaGroupFormSchema),
  })
  const {
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting },
  } = form
  const router = useRouter()

  const onSubmit = async (data: secretSantaGroupFormData) => {
    const { data: session } = await authClient.getSession()
    if (!session) redirect('/login')

    const result = await createSecretSantaGroup(data, session.user.id)

    if (!result.success) {
      setError(result.error!.field, { message: result.error!.message })
      return toast.error('Erro ao criar novo grupo')
    }

    if (result.group) {
      setGroups((prev) => [...prev, result.group])
      setIsOpen(false)
      reset()

      toast.success('Grupo criado com sucesso!')
      router.push(`/groups/${result.group.id}`)
      return
    }
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
              className="flex-1 md:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              className="flex-1 md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                'Criar grupo'
              )}
            </Button>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>
    </>
  )
}
