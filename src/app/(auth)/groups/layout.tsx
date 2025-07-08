import { AppSidebar } from '@/components/ui/app-sidebar'
import Navbar from '@/components/ui/navbar/navbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { getSessionOnServer } from '@/server/session'

export default async function WishlistLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSessionOnServer()

  return (
    <>
      <SidebarProvider>
        <AppSidebar session={session} />
        <div className="flex w-full flex-col">
          <Navbar />
          {children}
        </div>
      </SidebarProvider>
    </>
  )
}
