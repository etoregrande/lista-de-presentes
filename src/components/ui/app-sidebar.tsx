'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
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

interface AppSidebarProps {
  session: Session | null
}

export const AppSidebar = ({ session }: AppSidebarProps) => {
  const router = useRouter()
  const avatarImage = session?.user?.image ?? ''

  return (
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
        <SidebarGroup></SidebarGroup>
        <SidebarGroup> </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <p>Footer</p>
      </SidebarFooter>
    </Sidebar>
  )
}
