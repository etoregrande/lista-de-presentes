import { Gift } from 'lucide-react'
import { ResetPasswordForm } from './Reset-password-form'

export default function Page() {
  return (
    <div className="bg-[image:var(--gradient)]">
      <div className="mx-auto flex min-h-dvh flex-col items-center justify-center sm:max-w-4xl">
        <div className="flex flex-col rounded-2xl bg-white shadow-2xl md:flex-row">
          <div className="flex min-w-md items-center p-10">
            <ResetPasswordForm />
          </div>
        </div>
      </div>
    </div>
  )
}
