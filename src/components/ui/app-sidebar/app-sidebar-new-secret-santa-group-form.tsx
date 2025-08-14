import { secretSantaGroupFormData } from '@/types/secretSantaGroup'
import { Controller, useFormContext } from 'react-hook-form'
import { Input } from '../input'
import { FormInputWrapper } from '../form/form-input-wrapper'
import { Label } from '../label'
import { NumericFormat } from 'react-number-format'
import { FormError } from '../form/form-error'

export const AppSidebarNewSecretSantaGroupForm = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<secretSantaGroupFormData>()
  return (
    <>
      <form className="flex w-full flex-col gap-4 pb-1">
        <FormInputWrapper className="max-w-xs">
          <Label htmlFor="name" className="flex justify-between">
            Nome do grupo{' '}
            <span className="text-muted-foreground text-xs">obrigatório</span>
          </Label>
          <Input {...register('name')} />
          <FormError message={errors.name?.message} />
        </FormInputWrapper>

        <FormInputWrapper className="w-38">
          <Label htmlFor="priceLimit">Valor do presente</Label>
          <Controller
            name="priceLimit"
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
          <FormError message={errors.priceLimit?.message} />
          <FormError message={errors.root?.message} />
        </FormInputWrapper>
      </form>
    </>
  )
}
