'use client'

import {
  WishlistItem,
  EditWishlistItemFormDataType,
} from '@/types/wishlistItem'
import { setImageSrc } from '../actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button/button'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Controller, useForm } from 'react-hook-form'
import { deleteWishlistItem, editWishlistItem } from '@/server/wishlistItem'
import { authClient } from '@/lib/auth-client'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { LoaderCircle, Trash2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { editWishlistItemFormSchema } from '@/schemas/wishlistItem'
import { Switch } from '@/components/ui/switch'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { NumericFormat } from 'react-number-format'
import { getDisplayPrice } from '@/lib/utils'

interface WishlistItemCardDetailProps {
  wishlistItem: WishlistItem
  setOpenedWishlistItem: (wishlistItem: WishlistItem | null) => void
  setWishlist: Dispatch<SetStateAction<WishlistItem[]>>
  setOpenItem: Dispatch<SetStateAction<boolean>>
}

export const WishlistItemCardDetail = ({
  wishlistItem,
  setWishlist,
  setOpenItem,
}: WishlistItemCardDetailProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EditWishlistItemFormDataType>({
    resolver: zodResolver(editWishlistItemFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: wishlistItem?.name,
      description: wishlistItem?.description || undefined,
      price: wishlistItem?.price || null,
      link: wishlistItem?.link,
      priority: wishlistItem?.priority,
      isActive: wishlistItem?.is_active,
    },
  })
  const [isLoading, setIsloading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const watchedImage = watch('image')?.[0]

  useEffect(() => {
    if (wishlistItem) {
      reset({
        name: wishlistItem.name,
        description: wishlistItem.description || undefined,
        price: wishlistItem.price || null,
        link: wishlistItem.link,
        priority: wishlistItem.priority,
        isActive: wishlistItem.is_active,
      })
    }
  }, [wishlistItem, reset])

  useEffect(() => {
    const maxFileSize = 5 * 1024 * 1024
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    if (
      !watchedImage ||
      !imageTypes.includes(watchedImage.type) ||
      watchedImage.size > maxFileSize
    ) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(watchedImage)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [watchedImage])

  const handleDeleteWishlistItem = async () => {
    if (!wishlistItem.id) throw new Error('Unable to get wishlist item id')
    setWishlist((prev) => prev.filter((item) => item.id !== wishlistItem.id))
    setIsloading(true)

    await deleteWishlistItem(wishlistItem.id)

    setIsloading(false)
    setOpenItem(false)
    toast.success('Item deletado com sucesso!')
  }

  const handleEditWishlistItem = async (
    formData: EditWishlistItemFormDataType
  ) => {
    console.log(formData)

    const { data: session } = await authClient.getSession()
    if (!session) redirect('/login')
    if (!wishlistItem.id) throw new Error('Unable to get wishlist item id')

    const updatedItem = await editWishlistItem(
      formData,
      wishlistItem.id,
      session.user.id
    )

    setWishlist((prev) =>
      prev.map((item) =>
        item.id === wishlistItem.id
          ? {
              ...(updatedItem as WishlistItem),
            }
          : item
      )
    )

    setOpenItem(false)
    toast.success('Item editado com sucesso!')
  }

  const imageSrc = setImageSrc(wishlistItem)

  return (
    <>
      <div className="flex max-h-[calc(100vh-6rem)] flex-col gap-4 overflow-y-auto px-4 md:mb-0">
        <AspectRatio ratio={16 / 9}>
          <Label
            htmlFor="image"
            className="relative block h-full w-full cursor-pointer"
          >
            <Image
              src={previewUrl || imageSrc}
              alt="Imagem do produto"
              fill
              className="rounded-md object-cover"
              priority
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 p-12 text-center text-sm font-medium text-white transition-[background-color,color] md:text-base lg:bg-transparent lg:text-transparent lg:hover:bg-black/60 lg:hover:text-white">
              Alterar a imagem
            </div>
          </Label>
        </AspectRatio>

        <div>
          <h3 className="font-bold">{wishlistItem.name}</h3>
          {wishlistItem.price && wishlistItem.price > 0 ? (
            <p className="text-sm break-words text-[var(--muted-foreground)]">
              {getDisplayPrice(wishlistItem.price)}
            </p>
          ) : (
            <p className="text-sm break-words text-[var(--muted-foreground)]">
              Produto sem preço
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit(handleEditWishlistItem)}
          className="flex w-full flex-grow flex-col gap-4"
        >
          <div className="flew-row flex items-center justify-between">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="isActive"
                  />
                  <Label htmlFor="isActive">
                    {watch('isActive')
                      ? 'Produto visível'
                      : 'Produto invisível'}
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
              {isLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Trash2 />
              )}
            </Button>
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label
              htmlFor="name"
              className="flex items-center justify-between gap-1"
            >
              Nome
              <span className="text-muted-foreground text-xs">obrigatório</span>
            </Label>
            <Input {...register('name')} placeholder="" />
            {errors.name && (
              <div className="text-red-500">{errors.name.message}</div>
            )}
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea {...register('description')} placeholder="" />
            {errors.description && (
              <div className="text-red-500">{errors.description.message}</div>
            )}
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="price">Preço</Label>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <NumericFormat
                  thousandSeparator="."
                  decimalSeparator=","
                  decimalScale={2}
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
            {errors.price && (
              <div className="text-red-500">{errors.price.message}</div>
            )}
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="link">Link do produto</Label>
            <Input {...register('link')} inputMode="url" placeholder="" />
            {errors.link && (
              <div className="text-red-500">{errors.link.message}</div>
            )}
          </div>

          <div className="grid hidden w-full items-center gap-1.5">
            <Label htmlFor="image">Imagem do produto</Label>
            <Input
              {...register('image')}
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
            />
            {errors.image && (
              <div className="text-red-500">{String(errors.image.message)}</div>
            )}
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="priority">Prioridade</Label>
            <Controller
              control={control}
              name="priority"
              defaultValue="normal"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.priority && (
              <div className="text-red-500">{errors.priority.message}</div>
            )}
          </div>

          <Button className="flex-1" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              'Salvar'
            )}
          </Button>
        </form>
      </div>
    </>
  )
}
