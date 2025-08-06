export const dynamic = 'force-dynamic'

import './styles.css'
import Navbar from '@/components/ui/navbar/navbar'
import { AppSidebar } from '@/components/ui/app-sidebar/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { getSessionOnServer } from '@/server/session'
import { redirect } from 'next/navigation'
import { listSecretSantaGroups } from '@/server/secretSantaGroup'
import { SecretSantaGroupsProvider } from '@/lib/context/secretSantaGroups/provider'

export default async function WishlistLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSessionOnServer()

  if (!session) {
    redirect(`/login`)
  }

  const initialSecretSantaGroups = await listSecretSantaGroups(session.user.id)

  return (
    <SidebarProvider>
      <SecretSantaGroupsProvider initialGroups={initialSecretSantaGroups}>
        <AppSidebar session={session} />
        <div className="flex w-full flex-col">
          <Navbar />
          {children}
        </div>
      </SecretSantaGroupsProvider>
    </SidebarProvider>
  )
}
