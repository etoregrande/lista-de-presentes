'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { Gift as GiftIcon, Users as UsersIcon } from 'lucide-react'
import { Suspense, useState } from 'react'
import { NavbarNewSecretSantaGroupModal } from './app-sidebar-new-secret-santa-group-modal'
import { AppSidebarSecretSantaGroups } from './app-sidebar-secret-santa-groups'
import { AppSidebarAvatar } from './app-sidebar-avatar'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export const AppSidebar = () => {
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false)
  const pathname = usePathname()
  const href = '/wishlist'
  const isOnWishlist = pathname.startsWith(href)
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <>
      <NavbarNewSecretSantaGroupModal
        isOpen={isCreatingNewGroup}
        setIsOpen={setIsCreatingNewGroup}
      />

      <Sidebar>
        <SidebarHeader className="gap-0 p-0">
          <AppSidebarAvatar />
        </SidebarHeader>
        <SidebarContent>
          <hr className="border-sidebar-border" />
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg">
                  <Link
                    href={href}
                    className={clsx(
                      isOnWishlist && 'bg-sidebar-accent pointer-events-none'
                    )}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false)
                    }}
                  >
                    <GiftIcon className="-translate-y-[1px]" />
                    <span>Lista de Desejos</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuButton asChild size="lg">
                  <button
                    className={'cursor-pointer'}
                    onClick={() => {
                      setIsCreatingNewGroup(true)
                    }}
                  >
                    <UsersIcon className="-translate-y-[1px]" />
                    <span>Novo amigo secreto</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <hr className="border-sidebar-border" />
          <SidebarGroup>
            <SidebarGroupLabel>Amigos secretos</SidebarGroupLabel>
            <SidebarMenu>
              <Suspense fallback={<div>Carregando grupos...</div>}>
                <AppSidebarSecretSantaGroups />
              </Suspense>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <p>Footer</p>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}
