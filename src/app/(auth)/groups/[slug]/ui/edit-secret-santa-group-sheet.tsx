'use client'

import { ReactNode, useState } from 'react'
import { GroupDeleteButton } from './group-delete-button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { HoldSecretSantaDrawButton } from './hold-secret-santa-draw-button'
import { Button } from '@/components/ui/button/button'
import { LoaderCircle, Trash } from 'lucide-react'
import { EditGroupForm } from './edit-group-form'
import { FormProvider, useForm } from 'react-hook-form'
import { secretSantaGroupFormData } from '@/types/secretSantaGroup'
import { zodResolver } from '@hookform/resolvers/zod'
import { secretSantaGroupFormSchema } from '@/schemas/secretSantaGroup'
import { useSecretSantaGroup } from '../context/context'
import { updateSecretSantaGroup } from '@/server/secretSantaGroup'
import { useSession } from '@/lib/context/session/context'
import { toast } from 'sonner'

interface GroupEditProps {
  children: ReactNode
}

export const EditSecretSantaGroupSheet = ({ children }: GroupEditProps) => {
  const session = useSession()
  const { id: userId } = session.user
  const { secretSantaGroup } = useSecretSantaGroup()
  const { name, eventDate, priceLimit, id: groupId } = secretSantaGroup

  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const formMethods = useForm<secretSantaGroupFormData>({
    resolver: zodResolver(secretSantaGroupFormSchema),
    defaultValues: {
      name,
      priceLimit,
      eventDate,
    },
  })
  const {
    formState: { isSubmitting, isDirty },
    handleSubmit,
    reset,
  } = formMethods

  const onSubmit = async (formData: secretSantaGroupFormData) => {
    try {
      const response = await updateSecretSantaGroup(userId, groupId, formData)

      if (!response.success) {
        toast.error('Erro', {
          description: 'Falha ao atualizar amigo secreto',
        })
      }
      toast.success('O grupo foi salvo com sucesso!')
      setIsSheetOpen(false)
    } catch (error) {
      console.error(error)
      throw new Error('Erro ao atualizar amigo secreto')
    }
  }

  return (
    <FormProvider {...formMethods}>
      <Sheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open)
          if (!open) {
            reset({
              name,
              priceLimit,
              eventDate,
            })
          }
        }}
      >
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent side="right">
          <SheetHeader className="border-border flex-none border-b p-6 text-left">
            <SheetTitle>Configurar amigo secreto</SheetTitle>
            <SheetDescription>
              Altere as informações desse amigo secreto
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 p-5">
            <GroupDeleteButton>
              <Button
                variant={'destructive'}
                size={'icon'}
                className={'justify-self-end'}
              >
                <Trash />
              </Button>
            </GroupDeleteButton>
            <HoldSecretSantaDrawButton />
            <EditGroupForm />
          </div>

          <SheetFooter className="flex-none border-t p-6">
            <Button
              onClick={handleSubmit(onSubmit)}
              className="flex-1"
              type="submit"
              disabled={!isDirty || isSubmitting}
            >
              {isSubmitting ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                'Salvar'
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </FormProvider>
  )
}
