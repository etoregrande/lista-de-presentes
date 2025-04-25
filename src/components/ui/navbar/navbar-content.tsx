'use client'

import type { Session } from '@/lib/auth'
import { Gift } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLink,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AvatarFallback, Avatar, AvatarImage } from '@/components/ui/avatar'
import { signOut } from '@/server/auth'
import { getDisplayName, setAvatarFallbackString } from '@/lib/utils'
import { Button } from '@/components/ui/button/button'
import { useRouter } from 'next/navigation'

type Props = {
  session: Session | null
}

export default function NavbarContent({ session }: Props) {
  const router = useRouter()
  const avatarImage = session?.user?.image ?? ''

  return (
    <nav className="bg-navbar h-[var(--navbar-height)] w-full pt-[env(safe-area-inset-top)]">
      <div className="layout-container flex h-full items-center justify-between px-4 md:px-8 lg:px-0">
        <div className="text-primary flex items-center gap-2">
          <Gift className="-translate-y-0.5" />
          <p className="text-foreground font-extrabold tracking-tighter">
            Presenteio
          </p>
        </div>
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="group cursor-pointer">
              <div className="flex items-center gap-2">
                <p className="text-navbar-foreground truncate rounded-4xl text-sm group-hover:underline">
                  {getDisplayName(session.user.name)}
                </p>
                {session?.user && (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarImage} />
                    <AvatarFallback className="bg-navbar-muted-foreground font-bold">
                      {setAvatarFallbackString(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLink href="/wishlist">
                Lista de presentes
              </DropdownMenuLink>
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
      </div>
    </nav>
  )
}
