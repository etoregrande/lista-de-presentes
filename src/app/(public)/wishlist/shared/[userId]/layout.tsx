export const dynamic = 'force-dynamic'

import Navbar from '@/components/ui/navbar/navbar'
import { AppSidebar } from '@/components/ui/app-sidebar/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { getSessionOnServer } from '@/server/session'
import { listSecretSantaGroups } from '@/server/secretSantaGroup'
import { SecretSantaGroupsProvider } from '@/lib/context/secretSantaGroups/provider'
import { SessionProvider } from '@/lib/context/session/provider'

export default async function WishlistLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSessionOnServer()
  console.log(session)

  const initialSecretSantaGroups = session
    ? await listSecretSantaGroups(session.user.id)
    : []

  return (
    <SidebarProvider>
      <SessionProvider session={session}>
        <SecretSantaGroupsProvider initialGroups={initialSecretSantaGroups}>
          <AppSidebar />
          <div className="flex w-full flex-col">
            <Navbar />
            {children}
          </div>
        </SecretSantaGroupsProvider>
      </SessionProvider>
    </SidebarProvider>
  )
}
