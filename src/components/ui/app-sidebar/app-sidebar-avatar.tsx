'use client'

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
import { useSession } from '@/lib/context/session/context'

export const AppSidebarAvatar = () => {
  const { user } = useSession()
  const router = useRouter()
  const avatarImage = user.image ?? ''

  return (
    <>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="group cursor-pointer focus:outline-1">
            <div className="flex items-center gap-2">
              {user && (
                <Avatar className="h-10 w-10">
                  <AvatarImage src={avatarImage} />
                  <AvatarFallback className="bg-navbar-muted-foreground font-bold">
                    {setAvatarFallbackString(user.name)}
                  </AvatarFallback>
                </Avatar>
              )}
              <p className="text-navbar-foreground truncate rounded-4xl text-sm group-hover:underline">
                {getDisplayName(user.name)}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
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
