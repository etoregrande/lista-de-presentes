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
import { Session } from '@/lib/auth'
import Link from 'next/link'
import { Plus, ScrollText } from 'lucide-react'
import { Suspense, useState } from 'react'
import { NavbarNewSecretSantaGroupModal } from '../navbar/navbar-new-secret-santa-group-modal'
import { AppSidebarSecretSantaGroups } from './app-sidebar-secret-santa-groups'
import { AppSidebarAvatar } from './app-sidebar-avatar'
import { SecretSantaGroup } from '@/generated/prisma'

interface AppSidebarProps {
  session: Session
}

export const AppSidebar = ({ session }: AppSidebarProps) => {
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false)
  const [groups, setGroups] = useState<SecretSantaGroup[]>([])

  return (
    <>
      <NavbarNewSecretSantaGroupModal
        isOpen={isCreatingNewGroup}
        setIsOpen={setIsCreatingNewGroup}
        setGroups={setGroups}
      />

      <Sidebar>
        <SidebarHeader>
          <AppSidebarAvatar session={session} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/wishlist">
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
                <AppSidebarSecretSantaGroups
                  session={session}
                  groups={groups}
                  setGroups={setGroups}
                />
              </Suspense>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Amigo secreto (convidado)</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/wishlist">
                    <span>Nome do grupo</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
