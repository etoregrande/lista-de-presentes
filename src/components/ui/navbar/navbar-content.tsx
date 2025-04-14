'use client'

import { useEffect, useState } from 'react'
import type { Session } from '@/lib/auth'
import { Gift } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
            className={`fixed top-0 left-0 z-50 w-full transition-transform duration-300 ${
                show ? 'translate-y-0' : '-translate-y-full'
            }`}
        >
            <nav className="h-16 w-full border bg-slate-100 pt-[env(safe-area-inset-top)] md:h-14">
                <div className="layout-container flex h-full items-center justify-between px-4 md:px-8 lg:px-0">
                    <div className="flex items-center gap-2">
                        <Gift className="text-slate-500" />
                        <p>Presenteio</p>
                    </div>
                    {session?.user ? (
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger className="group">
                                <div className="flex items-center gap-2">
                                    <p className="truncate rounded-4xl px-2 group-hover:bg-slate-200">
                                        {getDisplayName(session.user.name)}
                                    </p>
                                    {session?.user && (
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={avatarImage} />
                                            <AvatarFallback className="bg-slate-200 font-bold">
                                                {setAvatarFallbackString(
                                                    session.user.name
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem disabled>
                                    Perfil
                                </DropdownMenuItem>
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
        </div>
    )
}
