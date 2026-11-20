import { WishlistItemFormData } from '@/types/wishlistItem'
import { Controller, useFormContext } from 'react-hook-form'
import Image from 'next/image'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Switch } from '@/components/ui/switch'
import { useWishlistImagePreview } from './use-wishlist-image-preview'
import { WishlistProductFields } from './wishlist-product-fields'
import { WishlistItemPlaceholder } from '@/components/ui/wishlist-item-placeholder'
import { FormError } from '@/components/ui/form/form-error'
import {
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
} from '@/components/ui/credenza'

export const WishlistNewItemSheetForm = ({
  importMessage,
}: {
  importMessage: string
}) => {
  const {
    register,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<WishlistItemFormData>()
  const selectedImage = useWishlistImagePreview()
  const currentName = watch('name')

  return (
    <div className="product-dialog-body min-h-0 flex-1 overflow-y-auto">
      <form className="grid gap-6 p-5 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:gap-8 md:p-8">
        <div className="space-y-4">
          <CredenzaHeader className="p-0 pr-12 text-left md:pr-0">
            <CredenzaTitle className="line-clamp-3 text-2xl leading-tight break-words md:text-3xl">
              {currentName?.trim() || 'Novo item'}
            </CredenzaTitle>
            <CredenzaDescription>
              {importMessage || 'Adicione informações ao seu novo item'}
            </CredenzaDescription>
          </CredenzaHeader>
          <div>
            <AspectRatio
              ratio={16 / 9}
              className="bg-muted max-h-64 rounded-2xl"
            >
              <Label
                htmlFor="image"
                className="group relative block h-full w-full cursor-pointer"
              >
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt="Imagem do produto"
                    fill
                    sizes="(max-width: 768px) 100vw, 350px"
                    className="rounded-2xl object-cover"
                  />
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
            <FormError message={errors.image?.message} />
          </div>
          <div className="border-border bg-muted/50 space-y-3 rounded-2xl border p-4">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <div className="flex items-center gap-3">
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
            {!watch('isActive') && (
              <p role="status" className="text-muted-foreground text-sm">
                Este produto não vai aparecer na sua lista compartilhada.
              </p>
            )}
          </div>
        </div>
        <WishlistProductFields />
      </form>
    </div>
  )
}
