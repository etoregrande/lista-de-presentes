'use client'

import { EditWishlistItemFormDataType } from '@/types/wishlistItem'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button/button'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
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
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { LoaderCircle, Trash2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { editWishlistItemFormSchema } from '@/schemas/wishlistItem'
import { Switch } from '@/components/ui/switch'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { NumericFormat } from 'react-number-format'
import { getDisplayPrice } from '@/lib/utils'
import { WishlistItem } from '@/types/db'
import placeholder from '@/../public/assets/wishlist-item-placeholder.svg'
import { motion } from 'framer-motion'
import { WishlistItemSheetTrigger } from './Wishlist-item-sheet-trigger'

interface WishlistItemSheetProps {
  wishlistItem: Partial<WishlistItem>
  setWishlist: Dispatch<SetStateAction<Partial<WishlistItem>[]>>
}

export const WishlistItemSheet = ({
  wishlistItem,
  setWishlist,
}: WishlistItemSheetProps) => {
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
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

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

  const handleDeleteWishlistItem = async () => {
    if (!wishlistItem.id) throw new Error('Unable to get wishlist item id')
    setIsloading(true)

    await deleteWishlistItem(wishlistItem.id)

    setIsSheetOpen(false)
    setIsloading(false)
    setTimeout(() => {
      setWishlist((prev) => prev.filter((item) => item.id !== wishlistItem.id))
    }, 300)

    toast.success('Item deletado com sucesso!')
  }

  const onSubmit = async (formData: EditWishlistItemFormDataType) => {
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

    setIsSheetOpen(false)
    toast.success('Item editado com sucesso!')
  }

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger>
          <WishlistItemSheetTrigger wishlistItem={wishlistItem} />
        </SheetTrigger>
        <SheetContent side="right" className="p-0">
          <SheetHeader className="border-border flex-none border-b p-6 text-left">
            <SheetTitle>{wishlistItem.name}</SheetTitle>
            <SheetDescription>
              <span className="text-sm break-words text-[var(--muted-foreground)]">
                {wishlistItem.price && wishlistItem.price > 0
                  ? getDisplayPrice(wishlistItem.price)
                  : 'Produto sem preço'}
              </span>
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <form className="space-y-6 p-6">
              <AspectRatio ratio={16 / 9} className="rounded-md bg-purple-50">
                <Label
                  htmlFor="image"
                  className="relative block h-full w-full cursor-pointer"
                >
                  <Image
                    src={wishlistItem.image ?? placeholder}
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
                  <span className="text-muted-foreground text-xs">
                    obrigatório
                  </span>
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
                  <div className="text-red-500">
                    {errors.description.message}
                  </div>
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
                  <div className="text-red-500">
                    {String(errors.image.message)}
                  </div>
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
            </form>
          </div>
          <SheetFooter className="flex-none border-t p-6">
            <Button
              onClick={handleSubmit(onSubmit)}
              className="flex-1"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                'Salvar'
              )}
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              className="flex-1"
              type="button"
              variant="secondary"
            >
              Cancelar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
