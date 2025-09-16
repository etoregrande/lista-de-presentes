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
    : [
        {
          id: 'group_1',
          name: 'Natal em Família',
          createdAt: new Date('2024-12-01T10:00:00Z'),
          image: null,
          slug: 'natal-em-familia',
          priceLimit: 100,
          eventDate: new Date('2024-12-24T20:00:00Z'),
          isDrawn: true,
          drawDate: new Date('2024-12-05T18:00:00Z'),
          ownerId: 'user_123',
        },
        {
          id: 'group_2',
          name: 'Amigos do Trabalho',
          createdAt: new Date('2025-01-10T14:30:00Z'),
          image: 'https://placekitten.com/200/200',
          slug: 'amigos-do-trabalho',
          priceLimit: null,
          eventDate: null,
          isDrawn: false,
          drawDate: null,
          ownerId: 'user_456',
        },
      ]

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
