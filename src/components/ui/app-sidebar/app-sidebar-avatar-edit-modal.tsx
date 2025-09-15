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
  const {
    user: { image: userImage, name: userName, id: userId },
  } = useSession()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

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
      const updatedUser = await updateUserAvatar(formData, userId)

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
            <AspectRatio
              ratio={4 / 4}
              className="bg-secondary-foreground rounded-full"
            >
              <Label
                htmlFor="image"
                className="relative block h-full w-full cursor-pointer rounded-full"
              >
                {selectedImage || userImage ? (
                  <Image
                    key={selectedImage || userImage}
                    src={selectedImage || `${userImage}?t=${Date.now()}`}
                    alt="Imagem do produto"
                    fill
                    sizes="(max-width: 768px) 100vw, 350px"
                    className="rounded-full object-cover"
                    priority
                  />
                ) : (
                  <p className="bg-navbar-muted-foreground h-full w-full content-center rounded-full text-center text-7xl">
                    {setAvatarFallbackString(userName)}
                  </p>
                )}

                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 p-12 text-center text-sm font-medium text-white transition-[background-color,color] md:text-base lg:bg-transparent lg:text-transparent lg:hover:bg-black/60 lg:hover:text-white">
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
