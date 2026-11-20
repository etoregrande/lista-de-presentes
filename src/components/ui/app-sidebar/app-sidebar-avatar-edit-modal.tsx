import { Dispatch, SetStateAction, useState } from 'react'
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from '../credenza'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import Image from 'next/image'
import { Label } from '../label'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AvatarImageFormData } from '@/types/avatarImage'
import { avatarImageFormSchema } from '@/schemas/avatarImage'
import { useSession } from '@/lib/context/session/context'
import { Input } from '../input'
import { FormError } from '../form/form-error'
import { setAvatarFallbackString } from '@/lib/utils'
import { Button } from '../button'
import { toast } from 'sonner'
import { LoaderCircle } from 'lucide-react'
import { updateUserAvatar } from '@/server/user'

interface AppSidebarAvatarEditModalProps {
  isOpen: boolean
  setIsOpen?: Dispatch<SetStateAction<boolean>>
}

export const AppSidebarAvatarEditModal = ({
  isOpen,
  setIsOpen,
}: AppSidebarAvatarEditModalProps) => {
  const {
    setValue,
    register,
    reset,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<AvatarImageFormData>({
    resolver: zodResolver(avatarImageFormSchema),
    defaultValues: {
      image: null,
    },
  })
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const session = useSession()
  if (!session) return null
  const {
    user: { image: userImage, name: userName },
  } = session

  const handleOpenChange = (open: boolean) => {
    setIsOpen?.(open)
    if (!open) {
      setTimeout(() => {
        reset()
        setSelectedImage(null)
      }, 300)
    }
  }

  const onSubmit = async (formData: AvatarImageFormData) => {
    try {
      const updatedUser = await updateUserAvatar(formData)

      if (updatedUser) {
        toast.success('Foto de perfil atualizada com sucesso!')
        handleOpenChange(false)
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao atualizar foto de perfil')
    }
  }

  return (
    <Credenza open={isOpen} onOpenChange={handleOpenChange}>
      <CredenzaContent className="md:w-90">
        <CredenzaHeader>
          <CredenzaTitle>Foto de perfil</CredenzaTitle>
          <CredenzaDescription>
            Clique para alterar a imagem
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaBody className="md:overflow-visible">
          <form>
            <AspectRatio ratio={4 / 4} className="bg-accent rounded-full">
              <Label
                htmlFor="image"
                className="group relative block h-full w-full cursor-pointer rounded-full"
              >
                {selectedImage || userImage ? (
                  <Image
                    key={selectedImage || userImage}
                    src={
                      selectedImage ||
                      `${userImage}?t=${session.user.updatedAt.getTime()}`
                    }
                    alt="Imagem do produto"
                    fill
                    sizes="(max-width: 768px) 100vw, 350px"
                    className="rounded-full object-cover"
                    priority
                  />
                ) : (
                  <p className="bg-accent text-accent-foreground h-full w-full content-center rounded-full text-center text-7xl font-bold">
                    {setAvatarFallbackString(userName)}
                  </p>
                )}

                <div className="absolute inset-x-5 bottom-5 rounded-full bg-black/65 px-4 py-2 text-center text-sm font-medium text-white transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                  Alterar a imagem
                </div>
                <Input
                  id="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  {...register('image')}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]

                    if (!file) return
                    setValue('image', file)

                    const valid = await trigger('image')
                    if (valid) {
                      setSelectedImage(URL.createObjectURL(file))
                      return
                    }
                    setSelectedImage(null)
                  }}
                  className="hidden"
                />
              </Label>
            </AspectRatio>
            <FormError message={errors.image?.message} className="mt-4" />
          </form>
        </CredenzaBody>
        <CredenzaFooter className="flex flex-col gap-2 md:flex-row">
          <Button
            variant={'secondary'}
            disabled={isSubmitting}
            type={'button'}
            className="md:w-1/2"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            disabled={isSubmitting}
            className="md:w-1/2"
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              'Salvar'
            )}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
