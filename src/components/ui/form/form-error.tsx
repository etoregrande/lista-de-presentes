import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form'

interface FormErrorProps {
  message:
    | string
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<any>>
    | undefined
  className?: string
}

export const FormError = ({ message, className = '' }: FormErrorProps) => {
  if (!message) return null

  return (
    <p className={`mt-1 text-sm text-red-500 ${className}`}>
      {String(message)}
    </p>
  )
}
