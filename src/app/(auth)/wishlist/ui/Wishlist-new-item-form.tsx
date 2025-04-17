import { CreateWishlistItemFormDataType } from '@/types/wishlistItem'
import { Controller, useFormContext } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Image from 'next/image'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Textarea } from '@/components/ui/textarea'
import { NumericFormat } from 'react-number-format'
import placeholder from '@/../public/assets/wishlist-item-placeholder.svg'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'

export const WishlistNewItemForm = () => {
  const {
    register,
    watch,
    control,
    formState: { errors },
  } = useFormContext<CreateWishlistItemFormDataType>()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-8 p-6">
        <AspectRatio ratio={16 / 9} className="rounded-md bg-purple-50">
          <Label
            htmlFor="image"
            className="relative block h-full w-full cursor-pointer"
          >
            <Image
              src={selectedImage ?? placeholder}
              alt="Imagem do produto"
              fill
              className="rounded-md object-cover"
              priority
            />

            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 p-12 text-center text-sm font-medium text-white transition-[background-color,color] md:text-base lg:bg-transparent lg:text-transparent lg:hover:bg-black/60 lg:hover:text-white">
              Alterar a imagem
            </div>
            <Input
              {...register('image')}
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0]
                setSelectedImage(file ? URL.createObjectURL(file) : null)
                register('image').onChange(e)
              }}
              className="hidden"
            />
          </Label>
        </AspectRatio>
        {errors.image && (
          <div className="text-red-500">{String(errors.image.message)}</div>
        )}

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
      </div>
    </div>
  )
}
