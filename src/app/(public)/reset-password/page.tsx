import { ThemeToggle } from '@/components/ui/button/theme-toggle-button'
import { ResetPasswordForm } from './Reset-password-form'

export default function Page() {
  return (
    <div className="relative bg-[image:var(--gradient)]">
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex min-h-dvh flex-col items-center justify-center sm:max-w-4xl">
        <div className="bg-card flex flex-col rounded-2xl shadow-2xl md:flex-row">
          <div className="flex w-full max-w-md items-center p-6 sm:p-10">
            <ResetPasswordForm />
          </div>
        </div>
      </div>
    </div>
  )
}
