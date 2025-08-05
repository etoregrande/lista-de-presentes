import './styles.css'
import Navbar from '@/components/ui/navbar/navbar'
import { AppSidebar } from '@/components/ui/app-sidebar/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { getSessionOnServer } from '@/server/session'
import { redirect } from 'next/navigation'
import { listSecretSantaGroups } from '@/server/secretSantaGroup'
import { SecretSantaGroupsProvider } from '@/lib/context/secretSantaGroups/provider'
import { headers } from 'next/headers'

export default async function WishlistLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSessionOnServer()

  if (!session) {
    const headersList = await headers()

    const rawPath =
      headersList.get('x-invoke-path') ??
      new URL(
        headersList.get('referer') ?? '/',
        process.env.NEXT_PUBLIC_APP_URL
      ).pathname

    const callbackURL = rawPath.startsWith('/') ? rawPath : `/${rawPath}`

    redirect(`/login?callbackUrl=${encodeURIComponent(callbackURL)}`)
  }

  const initialSecretSantaGroups = await listSecretSantaGroups(session.user.id)

  return (
    <SidebarProvider>
      <SecretSantaGroupsProvider groups={initialSecretSantaGroups}>
        <AppSidebar session={session} />
      </SecretSantaGroupsProvider>
      <div className="flex w-full flex-col">
        <Navbar />
        {children}
      </div>
    </SidebarProvider>
  )
}
