import { redirect } from 'next/navigation'
import { getSessionOnServer } from '@/server/session'
import { getSafeAuthCallbackPath } from '@/lib/auth-callback'
import { CompleteProfileForm } from './profile-form'
import { ThemeToggle } from '@/components/ui/button/theme-toggle-button'
import { PaletteToggle } from '@/components/ui/button/palette-toggle-button'

export const dynamic = 'force-dynamic'

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const session = await getSessionOnServer()
  const safeCallback = getSafeAuthCallbackPath((await searchParams).callbackUrl)
  const callbackUrl = safeCallback.startsWith('/complete-profile')
    ? '/wishlist'
    : safeCallback
  if (!session)
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  if (session.user.name?.trim()) redirect(callbackUrl)

  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-[image:var(--gradient)] p-6">
      <div className="absolute top-5 right-5 flex gap-2">
        <ThemeToggle />
        <PaletteToggle />
      </div>
      <div className="surface-panel w-full max-w-md p-8 md:p-10">
        <h1 className="page-heading mb-2">Como devemos chamar você?</h1>
        <p className="text-muted-foreground mb-6">
          Seu nome aparecerá nas listas e grupos.
        </p>
        <CompleteProfileForm callbackUrl={callbackUrl} />
      </div>
    </main>
  )
}
