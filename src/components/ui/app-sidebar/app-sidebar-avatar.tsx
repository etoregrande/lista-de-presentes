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
import { useState } from 'react'
import { AppSidebarAvatarEditModal } from './app-sidebar-avatar-edit-modal'
import { useSession } from '@/lib/context/session/context'
import { AppearanceDialog } from '@/components/appearance/appearance-dialog'
import { Camera, LogOut, Palette } from 'lucide-react'

export const AppSidebarAvatar = () => {
  const session = useSession()
  const [isChangingAvatar, setIsChangingAvatar] = useState(false)
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false)
  const [appearanceVersion, setAppearanceVersion] = useState(0)

  if (!session) return null

  const { user } = session
  const avatarImage = user.image ?? ''

  return (
    <>
      <AppSidebarAvatarEditModal
        isOpen={isChangingAvatar}
        setIsOpen={setIsChangingAvatar}
      />
      {isAppearanceOpen && (
        <AppearanceDialog
          key={appearanceVersion}
          open={isAppearanceOpen}
          onOpenChange={setIsAppearanceOpen}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="hover:bg-sidebar-accent focus-visible:ring-sidebar-ring border-sidebar-border m-3 flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2"
          >
            {user && (
              <Avatar className="border-primary size-11 border-2">
                <AvatarImage src={avatarImage} />
                <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground font-bold">
                  {setAvatarFallbackString(user.name)}
                </AvatarFallback>
              </Avatar>
            )}
            <p className="text-navbar-foreground flex-1 truncate rounded-4xl text-base font-bold">
              {getDisplayName(user.name)}
            </p>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="min-w-52">
          <DropdownMenuItem onClick={() => setIsChangingAvatar(true)}>
            <Camera className="size-4" />
            Mudar foto
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setAppearanceVersion((version) => version + 1)
              setIsAppearanceOpen(true)
            }}
          >
            <Palette className="size-4" /> Aparência
          </DropdownMenuItem>
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="size-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
