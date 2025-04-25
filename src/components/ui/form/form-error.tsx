import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form'
import { AnimatePresence, motion } from 'framer-motion'

interface FormErrorProps {
  message:
    | string
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<FieldError>>
    | undefined
  className?: string
}

export const FormError = ({ message, className = '' }: FormErrorProps) => {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.p
          key="form-error"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className={`text-sm text-red-500 ${className}`}
        >
          {String(message)}
        </motion.p>
      )}
    </AnimatePresence>
  )
}
