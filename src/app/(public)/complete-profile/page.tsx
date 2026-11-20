import { redirect } from 'next/navigation'
import { getSessionOnServer } from '@/server/session'
import { getSafeAuthCallbackPath } from '@/lib/auth-callback'
import { CompleteProfileForm } from './profile-form'

export const dynamic = 'force-dynamic'

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const session = await getSessionOnServer()
  const safeCallback = getSafeAuthCallbackPath((await searchParams).callbackUrl)
  const callbackUrl = safeCallback.startsWith('/complete-profile') ? '/wishlist' : safeCallback
  if (!session) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  if (session.user.name?.trim()) redirect(callbackUrl)

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="bg-card w-full max-w-sm rounded-xl p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold">Como devemos chamar você?</h1>
        <p className="text-muted-foreground mb-6">Seu nome aparecerá nas listas e grupos.</p>
        <CompleteProfileForm callbackUrl={callbackUrl} />
      </div>
    </main>
  )
}
