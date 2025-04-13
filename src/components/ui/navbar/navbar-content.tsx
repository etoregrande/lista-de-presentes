'use client'

import { useEffect, useState } from 'react'
import type { Session } from '@/lib/auth'
import { Gift } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AvatarFallback, Avatar, AvatarImage } from '@/components/ui/avatar'
import { signOut } from '@/server/auth'
import { getDisplayName, setAvatarFallbackString } from '@/lib/utils'
import { Button } from '@/components/ui/button/button'
import { useRouter } from 'next/navigation'

type Props = {
  session: Session | null
}

export default function NavbarContent({ session }: Props) {
  const [show, setShow] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const router = useRouter()
  const avatarImage = session?.user?.image ?? ''

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShow(false)
      } else {
        setShow(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${show ? 'translate-y-0' : '-translate-y-full'
        }`}
    >
      <nav className="bg-slate-100 h-16 md:h-14 w-full pt-[env(safe-area-inset-top)] border">
        <div className="layout-container h-full flex items-center justify-between px-4 md:px-8 lg:px-0">
          <div className="flex gap-2 items-center">
            <Gift className="text-slate-500" />
            <p>Presenteio</p>
          </div>
          {session?.user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="group">
                <div className="flex gap-2 items-center">
                  <p className="truncate group-hover:bg-slate-200 rounded-4xl px-2">
                    {getDisplayName(session.user.name)}
                  </p>
                  {session?.user &&
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={avatarImage} />
                      <AvatarFallback className="font-bold bg-slate-200">{setAvatarFallbackString(session.user.name)}</AvatarFallback>
                    </Avatar>
                  }
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem disabled>Perfil</DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}><span>Sair</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button type='button' variant="link" onClick={() => { router.push('/login') }}>Fazer login</Button>
          )}
        </div>
      </nav>
    </div>
  )
}
