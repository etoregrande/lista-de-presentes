import clsx from 'clsx'
import { ReactNode } from 'react'

interface FormInputWrapperProps {
  children: ReactNode
  className?: string
}

export const FormInputWrapper = ({
  children,
  className,
}: FormInputWrapperProps) => {
  return (
    <div className={clsx('grid items-center gap-1.5', className)}>
      {children}
    </div>
  )
}
