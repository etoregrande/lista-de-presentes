'use client'

import Link from 'next/link'
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from '../sidebar'
import { useSecretSantaGroups } from '@/lib/context/secretSantaGroups/context'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export const AppSidebarSecretSantaGroups = () => {
  const { isMobile, setOpenMobile } = useSidebar()
  const { groups } = useSecretSantaGroups()

  const pathname = usePathname()

  return (
    <>
      {groups.map((group) => {
        const href = `/groups/${group.slug}`
        const isActive = pathname === href

        return (
          <SidebarMenuItem key={group.slug}>
            <SidebarMenuButton asChild>
              <Link
                href={href}
                className={clsx(
                  isActive && 'bg-sidebar-accent pointer-events-none'
                )}
                onClick={() => {
                  if (isMobile) setOpenMobile(false)
                }}
              >
                <span className="truncate">{group.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </>
  )
}
