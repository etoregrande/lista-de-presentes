import { WishlistItemFormData } from '@/types/wishlistItem'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { Textarea } from '@/components/ui/textarea'
import { Controller, useFormContext } from 'react-hook-form'
import { deleteWishlistItem } from '@/server/wishlistItem'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { LoaderCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { NumericFormat } from 'react-number-format'
import { WishlistItem } from '@/generated/prisma'
import placeholder from '@/../public/assets/wishlist-item-placeholder.svg'
import { FormError } from '@/components/ui/form/form-error'
import { FormInputWrapper } from '@/components/ui/form/form-input-wrapper'

interface WishlistItemSheetFormProps {
  wishlistItem: Partial<WishlistItem>
  setWishlist: Dispatch<SetStateAction<Partial<WishlistItem>[]>>
  setIsSheetOpen: Dispatch<SetStateAction<boolean>>
}

export const WishlistItemSheetForm = ({
  wishlistItem,
  setWishlist,
  setIsSheetOpen,
}: WishlistItemSheetFormProps) => {
  const {
    register,
    watch,
    trigger,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useFormContext<WishlistItemFormData>()
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const image = watch('image')

  useEffect(() => {
    let url: string | null = null

    if (image instanceof File) {
      // trigger zod validation for image
      trigger('image').then((isValid) => {
        if (isValid) {
          url = URL.createObjectURL(image)
          setSelectedImage(url)
        } else {
          setSelectedImage(null)
        }
      })
    } else {
      setSelectedImage(null)
    }

    // revokes the URL before running useEffect again or when component is unmounted
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [image, trigger])

  useEffect(() => {
    if (wishlistItem) {
      reset({
        name: wishlistItem.name ?? '',
        description: wishlistItem.description ?? '',
        price: wishlistItem.price ?? 0,
        link: wishlistItem.link ?? '',
        image: null,
        priority: wishlistItem.priority ?? 'normal',
        isActive: wishlistItem.isActive ?? true,
      })
    }
  }, [wishlistItem, reset])

  const handleDeleteWishlistItem = async () => {
    if (!wishlistItem.id) throw new Error('Unable to get wishlist item id')
    setIsDeleting(true)

    await deleteWishlistItem(wishlistItem.id)

    setIsSheetOpen(false)
    setIsDeleting(false)

    setTimeout(() => {
      setWishlist((prev) => prev.filter((item) => item.id !== wishlistItem.id))
    }, 300)

    toast.success('Item deletado com sucesso!')
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <form className="space-y-6 p-6">
        <div>
          <AspectRatio
            ratio={16 / 9}
            className="bg-secondary-foreground rounded-md"
          >
            <Label
              htmlFor="image"
              className="relative block h-full w-full cursor-pointer"
            >
              <Image
                src={selectedImage ?? wishlistItem.image ?? placeholder}
                alt="Imagem do produto"
                fill
                sizes="(max-width: 768px) 100vw, 350px"
                className="rounded-md object-cover"
                priority
              />

              <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 p-12 text-center text-sm font-medium text-white transition-[background-color,color] md:text-base lg:bg-transparent lg:text-transparent lg:hover:bg-black/60 lg:hover:text-white">
                Alterar a imagem
              </div>
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                {...register('image')}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  setValue('image', file)
                }}
                className="hidden"
              />
            </Label>
          </AspectRatio>
          <FormError message={errors.image?.message} />
        </div>

        <div className="flew-row flex items-center justify-between">
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <div className="flex h-full items-center space-x-2">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="isActive"
                />
                <Label htmlFor="isActive">
                  {watch('isActive') ? 'Produto visível' : 'Produto invisível'}
                </Label>
              </div>
            )}
          />

          <Button
            variant="secondary"
            type="button"
            size="icon"
            onClick={handleDeleteWishlistItem}
          >
            {isDeleting ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Trash2 />
            )}
          </Button>
        </div>

        <FormInputWrapper>
          <Label
            htmlFor="name"
            className="flex items-center justify-between gap-1"
          >
            Nome
            <span className="text-muted-foreground text-xs">obrigatório</span>
          </Label>
          <Input {...register('name')} placeholder="" />
          <FormError message={errors.name?.message} />
        </FormInputWrapper>

        <FormInputWrapper>
          <Label htmlFor="description">Descrição</Label>
          <Textarea {...register('description')} placeholder="" />
          <FormError message={errors.description?.message} />
        </FormInputWrapper>

        <FormInputWrapper>
          <Label htmlFor="price">Preço</Label>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <NumericFormat
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                fixedDecimalScale
                prefix="R$ "
                allowNegative={false}
                value={field.value ? field.value / 100 : ''}
                onValueChange={(values) => {
                  const { floatValue } = values
                  field.onChange(
                    floatValue !== undefined ? floatValue * 100 : null
                  )
                }}
                customInput={Input}
              />
            )}
          />
          <FormError message={errors.price?.message} />
        </FormInputWrapper>

        <FormInputWrapper>
          <Label htmlFor="link">Link do produto</Label>
          <Input {...register('link')} inputMode="url" placeholder="" />
          <FormError message={errors.link?.message} />
        </FormInputWrapper>
      </form>
    </div>
  )
}
