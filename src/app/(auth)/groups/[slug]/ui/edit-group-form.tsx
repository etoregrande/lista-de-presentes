'use client'

import { Controller, useFormContext } from 'react-hook-form'
import { FormInputWrapper } from '@/components/ui/form/form-input-wrapper'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FormError } from '@/components/ui/form/form-error'
import { NumericFormat } from 'react-number-format'

export const EditGroupForm = () => {
  const {
    formState: { errors },
    register,
    control,
  } = useFormContext()
  return (
    <form className="grid gap-5">
      <FormInputWrapper>
        <Label
          htmlFor="name"
          className="flex items-center justify-between gap-1"
        >
          Nome do grupo
          <span className="text-muted-foreground text-xs">obrigatório</span>
        </Label>
        <Input {...register('name')} />
        <FormError message={errors.name?.message} />
      </FormInputWrapper>
      <FormInputWrapper>
        <Label htmlFor="priceLimit">Valor do presente</Label>
        <Controller
          name="priceLimit"
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
        <FormError message={errors.priceLimit?.message} />
      </FormInputWrapper>
      <FormInputWrapper>
        <Label
          htmlFor="name"
          className="flex items-center justify-between gap-1"
        >
          Data do evento
        </Label>
        <Input {...register('name')} />
        <FormError message={errors.name?.message} />
      </FormInputWrapper>
    </form>
  )
}
