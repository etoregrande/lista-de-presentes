'use client'

import { Session } from '@/lib/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { getDisplayName, setAvatarFallbackString } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../avatar'
import { signOut } from '@/server/auth'
import { Button } from '../button/button'
import { useRouter } from 'next/navigation'

interface AppSidebarProps {
  session: Session
}

export const AppSidebarAvatar = ({ session }: AppSidebarProps) => {
  const router = useRouter()
  const avatarImage = session?.user?.image ?? ''

  return (
    <>
      {' '}
      {session?.user ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="group cursor-pointer focus:outline-1">
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
            {/* <DropdownMenuLink href="/wishlist">
              Lista de presentes
            </DropdownMenuLink>
            <DropdownMenuLink href="/groups">Grupos</DropdownMenuLink> */}
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
    </>
  )
}
