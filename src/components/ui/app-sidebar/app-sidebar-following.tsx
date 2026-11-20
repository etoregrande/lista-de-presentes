'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from '../sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '../avatar'
import { getDisplayName, setAvatarFallbackString } from '@/lib/utils'
import type { FollowedUser } from '@/lib/repositories/FollowRepository'

export function AppSidebarFollowing({ people }: { people: FollowedUser[] }) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  return people.map((person) => {
    const href = `/wishlist/shared/${person.id}`
    return (
      <SidebarMenuItem key={person.id}>
        <SidebarMenuButton
          asChild
          isActive={pathname === href}
          className="text-sidebar-foreground data-[active=true]:bg-sidebar-accent h-10 gap-2.5 rounded-lg px-3 text-sm font-medium"
        >
          <Link
            href={href}
            onClick={() => {
              if (isMobile) setOpenMobile(false)
            }}
          >
            <Avatar className="size-6 shrink-0">
              <AvatarImage src={person.image ?? ''} />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-[10px] font-bold">
                {setAvatarFallbackString(person.name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">
              {getDisplayName(person.name) ?? person.name}
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  })
}
