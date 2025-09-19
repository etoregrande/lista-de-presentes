'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import {
  Gift as GiftIcon,
  LoaderCircle as LoaderCircleIcon,
  Users as UsersIcon,
} from 'lucide-react'
import { Dispatch, SetStateAction, Suspense, useState } from 'react'
import { NavbarNewSecretSantaGroupModal } from './app-sidebar-new-secret-santa-group-modal'
import { AppSidebarSecretSantaGroups } from './app-sidebar-secret-santa-groups'
import { AppSidebarAvatar } from './app-sidebar-avatar'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { useSession } from '@/lib/context/session/context'
import Image from 'next/image'
import { Button } from '../button'

interface LoggedInContentProps {
  setIsCreatingNewGroup: Dispatch<SetStateAction<boolean>>
}

const LoggedInContent = ({ setIsCreatingNewGroup }: LoggedInContentProps) => {
  const pathname = usePathname()
  const href = '/wishlist'
  const isOnWishlist = pathname === href
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <SidebarContent>
      <hr className="border-sidebar-border" />
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link
                href={href}
                className={clsx(
                  isOnWishlist && 'bg-sidebar-accent pointer-events-none'
                )}
                onClick={() => {
                  if (isMobile) setOpenMobile(false)
                }}
              >
                <GiftIcon className="-translate-y-[1px]" />
                <span>Lista de Desejos</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton asChild size="lg">
              <button
                className={'cursor-pointer'}
                onClick={() => {
                  setIsCreatingNewGroup(true)
                }}
              >
                <UsersIcon className="-translate-y-[1px]" />
                <span>Novo amigo secreto</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <hr className="border-sidebar-border" />
      <SidebarGroup>
        <SidebarGroupLabel>Amigos secretos</SidebarGroupLabel>
        <SidebarMenu>
          <Suspense fallback={<div>Carregando grupos...</div>}>
            <AppSidebarSecretSantaGroups />
          </Suspense>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  )
}

const LoggedOffContent = () => {
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const redirectToLogin = () => {
    setIsRedirecting(true)

    const params = new URLSearchParams()
    params.set('callbackUrl', pathname)
    const callBackString = params.toString() ? `?${params.toString()}` : ''

    router.push(`/login${callBackString}`)

    setTimeout(() => {
      setIsRedirecting(false)
    }, 1500)
  }

  return (
    <SidebarContent>
      <SidebarGroup className="relative flex h-full flex-col items-center justify-center">
        <Image
          src="/assets/login/login.svg"
          alt="Usuário fazendo login"
          width={192}
          height={192}
          className="relative"
        />
        <Button
          onClick={redirectToLogin}
          disabled={isRedirecting}
          className="relative w-48"
        >
          <span className={isRedirecting ? 'invisible' : ''}>Fazer login</span>

          {isRedirecting && (
            <span className="absolute inset-0 flex items-center justify-center">
              <LoaderCircleIcon className="animate-spin" />
            </span>
          )}
        </Button>
      </SidebarGroup>
    </SidebarContent>
  )
}

export const AppSidebar = () => {
  const session = useSession()
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false)

  return (
    <>
      <NavbarNewSecretSantaGroupModal
        isOpen={isCreatingNewGroup}
        setIsOpen={setIsCreatingNewGroup}
      />

      <Sidebar>
        <SidebarHeader className="gap-0 p-0">
          <AppSidebarAvatar />
        </SidebarHeader>
        {session ? (
          <LoggedInContent setIsCreatingNewGroup={setIsCreatingNewGroup} />
        ) : (
          <LoggedOffContent />
        )}

        <SidebarFooter></SidebarFooter>
      </Sidebar>
    </>
  )
}
