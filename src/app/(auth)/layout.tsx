export const dynamic = 'force-dynamic'

import './styles.css'
import Navbar from '@/components/ui/navbar/navbar'
import { AppSidebar } from '@/components/ui/app-sidebar/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { getSessionOnServer } from '@/server/session'
import { redirect } from 'next/navigation'
import { listSecretSantaGroups } from '@/server/secretSantaGroup'
import { SecretSantaGroupsProvider } from '@/lib/context/secretSantaGroups/provider'
import { SessionProvider } from '@/lib/context/session/provider'
import { prisma } from '@/lib/prisma'
import { AppearanceSync } from '@/components/appearance/appearance-sync'
import { listFollowedUsers } from '@/lib/repositories/FollowRepository'

export default async function WishlistLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSessionOnServer()

  if (!session) {
    redirect(`/login`)
  }

  if (!session.user.name?.trim()) {
    redirect('/complete-profile')
  }

  const initialSecretSantaGroups = await listSecretSantaGroups()
  const following = await listFollowedUsers(session.user.id)
  const appearance = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { appearancePalette: true, appearanceTheme: true },
  })

  return (
    <SidebarProvider>
      <SessionProvider session={session}>
        <AppearanceSync
          palette={appearance?.appearancePalette ?? null}
          theme={appearance?.appearanceTheme ?? null}
        />
        <SecretSantaGroupsProvider initialGroups={initialSecretSantaGroups}>
          <AppSidebar following={following} />
          <div className="flex w-full flex-col">
            <Navbar />
            {children}
          </div>
        </SecretSantaGroupsProvider>
      </SessionProvider>
    </SidebarProvider>
  )
}
