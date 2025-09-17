import clsx from 'clsx'
import { ReactNode } from 'react'

interface InputWrapperProps {
  children: ReactNode
  className?: string
}

export const InputWrapper = ({ children, className }: InputWrapperProps) => {
  return (
    <div className={clsx('grid items-center gap-1.5', className)}>
      {children}
    </div>
  )
}
