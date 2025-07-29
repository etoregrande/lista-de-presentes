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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLink,
} from '@/components/ui/dropdown-menu'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { getDisplayName, setAvatarFallbackString } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { Session } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { signOut } from '@/server/auth'
import { Button } from './button/button'
import Link from 'next/link'
import { Plus, ScrollText } from 'lucide-react'
import { useState } from 'react'
import { NavbarNewSecretSantaGroupModal } from './navbar/navbar-new-secret-santa-group-modal'

interface AppSidebarProps {
  session: Session | null
}

export const AppSidebar = ({ session }: AppSidebarProps) => {
  const router = useRouter()
  const avatarImage = session?.user?.image ?? ''
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false)

  return (
    <>
      <NavbarNewSecretSantaGroupModal
        isOpen={isCreatingNewGroup}
        setIsOpen={setIsCreatingNewGroup}
      />

      <Sidebar>
        <SidebarHeader>
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="group cursor-pointer focus:pl-2">
                <div className="flex items-center gap-2">
                  {session?.user && (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatarImage} />
                      <AvatarFallback className="bg-navbar-muted-foreground font-bold">
                        {setAvatarFallbackString(session.user.name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <p className="text-navbar-foreground truncate rounded-4xl text-sm group-hover:underline">
                    {getDisplayName(session.user.name)}
                  </p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLink href="/wishlist">
                  Lista de presentes
                </DropdownMenuLink>
                <DropdownMenuLink href="/groups">Grupos</DropdownMenuLink>
                <DropdownMenuItem disabled>Perfil</DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              type="button"
              variant="link"
              onClick={() => {
                router.push('/login')
              }}
            >
              Fazer login
            </Button>
          )}
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
              title="Add Project"
              onClick={() => {
                console.log('Add Project clicked')
                setIsCreatingNewGroup(true)
              }}
            >
              <Plus /> <span className="sr-only">Add Project</span>
            </SidebarGroupAction>
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
