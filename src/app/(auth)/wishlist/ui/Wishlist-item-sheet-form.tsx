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
import { WishlistItemPlaceholder } from '@/components/ui/wishlist-item-placeholder'
import { FormError } from '@/components/ui/form/form-error'
import { InputWrapper } from '@/components/ui/form/form-input-wrapper'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getDisplayPrice } from '@/lib/utils'

interface WishlistItemSheetFormProps {
  wishlistItem: Partial<WishlistItem>
  setWishlist: Dispatch<SetStateAction<WishlistItem[]>>
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
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(
    null
  )
  const image = watch('image')
  const currentName = watch('name')
  const currentPrice = watch('price')
  const selectedImage = preview && preview.file === image ? preview.url : null

  useEffect(() => {
    if (!(image instanceof File)) return

    let cancelled = false
    let url: string | null = null
    trigger('image').then((isValid) => {
      if (cancelled) return
      if (isValid) {
        url = URL.createObjectURL(image)
        setPreview({ file: image, url })
      } else {
        setPreview(null)
      }
    })

    return () => {
      cancelled = true
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

    try {
      const result = await deleteWishlistItem(wishlistItem.id)
      if (result === null) {
        toast.error('Erro ao deletar item')
        return
      }
      setIsSheetOpen(false)
      setTimeout(() => {
        setWishlist((prev) =>
          prev.filter((item) => item.id !== wishlistItem.id)
        )
      }, 300)
      toast.success('Item deletado com sucesso!')
    } catch {
      toast.error(
        'Erro ao deletar item. Verifique sua sessão e tente novamente'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="product-dialog-body min-h-0 flex-1 overflow-y-auto">
      <form className="grid gap-6 p-5 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:gap-8 md:p-8">
        <div className="space-y-4">
          <DialogHeader className="pr-12 text-left md:pr-0">
            <DialogTitle className="text-2xl leading-tight break-words md:text-3xl">
              {currentName?.trim() || wishlistItem.name}
            </DialogTitle>
            <DialogDescription className="text-base font-medium">
              {typeof currentPrice === 'number' && currentPrice > 0
                ? getDisplayPrice(currentPrice)
                : 'Produto sem preço'}
            </DialogDescription>
          </DialogHeader>
          <div>
            <div className="overflow-hidden rounded-2xl">
              <AspectRatio
                ratio={16 / 9}
                className="bg-muted max-h-64 rounded-2xl"
              >
                <Label
                  htmlFor="image"
                  className="group relative block h-full w-full cursor-pointer"
                >
                  {selectedImage || wishlistItem.image ? (
                    <Image src={selectedImage ?? wishlistItem.image!} alt="Imagem do produto" fill sizes="(max-width: 768px) 100vw, 350px" className="rounded-2xl object-cover" />
                  ) : (
                    <WishlistItemPlaceholder className="absolute inset-0 m-auto size-[58%]" />
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-black/60 px-4 py-2 text-center text-sm font-medium text-white transition-opacity lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100">
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
            </div>
            <FormError message={errors.image?.message} />
          </div>

          <div className="border-border bg-muted/50 space-y-3 rounded-2xl border p-4">
            <div className="flex items-center justify-between gap-3">
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <div className="flex min-w-0 items-center gap-3">
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
                variant="destructive"
                type="button"
                size="icon"
                aria-label="Excluir item"
                title="Excluir item"
                onClick={handleDeleteWishlistItem}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Trash2 />
                )}
              </Button>
            </div>
            {!watch('isActive') && (
              <p role="status" className="text-muted-foreground text-sm">
                Este produto não vai aparecer na sua lista compartilhada.
              </p>
            )}
          </div>
        </div>
        <div className="space-y-5 md:pt-11">
          <InputWrapper>
            <Label
              htmlFor="name"
              className="flex items-center justify-between gap-1"
            >
              Nome
              <span className="text-muted-foreground text-xs">obrigatório</span>
            </Label>
            <Input id="name" {...register('name')} placeholder="" />
            <FormError message={errors.name?.message} />
          </InputWrapper>

          <InputWrapper>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder=""
            />
            <FormError message={errors.description?.message} />
          </InputWrapper>

          <InputWrapper>
            <Label htmlFor="price">Preço</Label>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <NumericFormat
                  inputMode="decimal"
                  thousandSeparator="."
                  decimalSeparator=","
                  decimalScale={2}
                  fixedDecimalScale
                  prefix="R$ "
                  allowNegative={false}
                  value={field.value != null ? field.value / 100 : ''}
                  onValueChange={(values) => {
                    const { floatValue } = values
                    field.onChange(
                      floatValue !== undefined
                        ? Math.round(floatValue * 100)
                        : null
                    )
                  }}
                  customInput={Input}
                  id="price"
                />
              )}
            />
            <FormError message={errors.price?.message} />
          </InputWrapper>

          <InputWrapper>
            <Label htmlFor="link">Link do produto</Label>
            <Input
              id="link"
              {...register('link')}
              inputMode="url"
              placeholder=""
            />
            <FormError message={errors.link?.message} />
          </InputWrapper>
        </div>
      </form>
    </div>
  )
}
