'use client'

import { Controller, useFormContext } from 'react-hook-form'
import { FormInputWrapper } from '@/components/ui/form/form-input-wrapper'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FormError } from '@/components/ui/form/form-error'
import { NumericFormat } from 'react-number-format'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button/button'
import { cn } from '@/lib/utils'
import { ptBR } from 'date-fns/locale'
import { addYears, format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'

export const EditGroupForm = () => {
  const {
    formState: { errors },
    register,
    control,
  } = useFormContext()
  return (
    <>
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

        <Controller
          control={control}
          name="eventDate"
          render={({ field }) => (
            <FormInputWrapper className="flex w-full flex-col">
              <Label>Data do sorteio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'border-border w-full pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    {field.value ? (
                      format(field.value, 'PPP', { locale: ptBR })
                    ) : (
                      <span>Escolha uma data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date() || date < new Date('1900-01-01')
                    }
                    captionLayout="dropdown"
                    startMonth={new Date()}
                    endMonth={addYears(new Date(), 2)}
                  />
                </PopoverContent>
              </Popover>
            </FormInputWrapper>
          )}
        />
      </form>
    </>
  )
}
