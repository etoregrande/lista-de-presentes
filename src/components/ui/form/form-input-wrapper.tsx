import { ReactNode } from 'react'

interface FormInputWrapperProps {
  children: ReactNode
}

export const FormInputWrapper = ({ children }: FormInputWrapperProps) => {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">{children}</div>
  )
}
