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
import { useSession } from '@/lib/context/session/context'
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
    <SidebarContent className="px-3 pt-2 pb-5">
      <SidebarGroup className="p-1">
        <SidebarMenu className="gap-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              isActive={isOnWishlist}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-secondary-foreground data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground h-11 gap-3 rounded-xl px-3.5 shadow-sm"
            >
              <Link
                href={href}
                onClick={() => {
                  if (isMobile) setOpenMobile(false)
                }}
              >
                <GiftIcon aria-hidden="true" />
                <span style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                  Lista de Desejos
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="border-primary/25 bg-primary/10 text-sidebar-foreground hover:bg-primary/20 h-11 gap-3 rounded-xl border px-3.5"
            >
              <button
                className="cursor-pointer"
                onClick={() => {
                  setIsCreatingNewGroup(true)
                }}
              >
                <UsersIcon aria-hidden="true" />
                <span style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                  Novo amigo secreto
                </span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="border-sidebar-border mt-4 border-t px-1 pt-4 pb-1">
        <SidebarGroupLabel className="text-sidebar-foreground/65 h-8 px-3 text-xs font-bold tracking-[0.12em] uppercase">
          Amigos secretos
        </SidebarGroupLabel>
        <SidebarMenu className="gap-0.5">
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
        <div className="mb-6 grid size-36 rotate-[-8deg] place-items-center rounded-[2.5rem] bg-[image:var(--gradient)] shadow-lg">
          <GiftIcon
            className="text-primary size-20"
            strokeWidth={1.3}
            aria-hidden="true"
          />
        </div>
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

      <Sidebar className="border-sidebar-border border-r">
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
