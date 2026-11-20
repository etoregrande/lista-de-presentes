import { Controller, useFormContext } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { InputWrapper } from '@/components/ui/form/form-input-wrapper'
import { FormError } from '@/components/ui/form/form-error'
import type { WishlistItemFormData } from '@/types/wishlistItem'

export function WishlistProductFields({
  fixedDecimalScale = false,
}: {
  fixedDecimalScale?: boolean
}) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<WishlistItemFormData>()

  return (
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
              fixedDecimalScale={fixedDecimalScale}
              prefix="R$ "
              allowNegative={false}
              value={field.value != null ? field.value / 100 : ''}
              onValueChange={({ floatValue }) => {
                field.onChange(
                  floatValue !== undefined ? Math.round(floatValue * 100) : null
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
        <Input id="link" {...register('link')} inputMode="url" placeholder="" />
        <FormError message={errors.link?.message} />
      </InputWrapper>
    </div>
  )
}
