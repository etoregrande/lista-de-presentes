'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { Plus, ScrollText } from 'lucide-react'
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

  return (
    <>
      <NavbarNewSecretSantaGroupModal
        isOpen={isCreatingNewGroup}
        setIsOpen={setIsCreatingNewGroup}
      />

      <Sidebar>
        <SidebarHeader>
          <AppSidebarAvatar />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href={href}
                    className={clsx(
                      'hover:bg-primary-foreground hover:text-primary',
                      isOnWishlist &&
                        'bg-primary-foreground text-primary pointer-events-none'
                    )}
                  >
                    <ScrollText />
                    <span>Lista de Desejos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Amigo secreto</SidebarGroupLabel>
            <SidebarGroupAction
              title="Novo amigo secreto"
              onClick={() => {
                setIsCreatingNewGroup(true)
              }}
            >
              <Plus /> <span className="sr-only">Novo amigo secreto</span>
            </SidebarGroupAction>
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
