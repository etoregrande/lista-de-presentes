'use client'

import Link from 'next/link'
import { SidebarMenuButton, SidebarMenuItem } from '../sidebar'
import { useSecretSantaGroups } from '@/lib/context/secretSantaGroups/context'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export const AppSidebarSecretSantaGroups = () => {
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
