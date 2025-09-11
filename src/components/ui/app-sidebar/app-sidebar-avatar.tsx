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
import { useState } from 'react'
import { AppSidebarAvatarEditModal } from './app-sidebar-avatar-edit-modal'
import { useSidebar } from '../sidebar'

export const AppSidebarAvatar = () => {
  const { user } = useSession()
  const router = useRouter()
  const avatarImage = user.image ?? ''
  const [isChangingAvatar, setIsChangingAvatar] = useState(false)
  const { isMobile } = useSidebar()

  return (
    <>
      {user ? (
        <>
          <AppSidebarAvatarEditModal
            isOpen={isChangingAvatar}
            setIsOpen={setIsChangingAvatar}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                tabIndex={isMobile ? -1 : 0}
                className="hover:bg-sidebar-accent focus:bg-sidebar-ring flex min-w-0 cursor-pointer items-center gap-3 py-4 pr-2 pl-3 focus:outline-none"
              >
                {user && (
                  <Avatar className="border-primary outline-primary size-10 outline-2 outline-offset-2">
                    <AvatarImage src={avatarImage} />
                    <AvatarFallback className="bg-navbar-muted-foreground font-bold">
                      {setAvatarFallbackString(user.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <p className="text-navbar-foreground flex-1 truncate rounded-4xl text-base font-bold">
                  {getDisplayName(user.name)}
                </p>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setIsChangingAvatar(true)}>
                Mudar foto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
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
