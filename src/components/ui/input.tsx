import * as React from 'react'

import { cn } from '@/lib/utils'
import { Eye, EyeClosed } from 'lucide-react'

export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input bg-card flex h-11 w-full min-w-0 rounded-xl border px-4 py-2 text-base shadow-sm transition-[border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      {...props}
    />
  )
}

export function PasswordInput({
  className,
  ...props
}: React.ComponentProps<'input'>) {
  const [type, setType] = React.useState<'text' | 'password'>('password')

  const togglePasswordVisibility = () => {
    setType((prev) => (prev === 'password' ? 'text' : 'password'))
  }

  return (
    <div className="relative w-full">
      <input
        type={type}
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input bg-card flex h-11 w-full min-w-0 rounded-xl border px-4 py-2 text-base shadow-sm transition-[border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className
        )}
        {...props}
      />
      <button
        type="button"
        onClick={togglePasswordVisibility}
        tabIndex={-1}
        aria-label={type === 'password' ? 'Mostrar senha' : 'Esconder senha'}
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 transition-colors"
      >
        {type === 'password' ? (
          <EyeClosed className="size-5" />
        ) : (
          <Eye className="size-5" />
        )}
      </button>
    </div>
  )
}
