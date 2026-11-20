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
            <SidebarMenuButton
              asChild
              isActive={isActive}
              className="text-sidebar-foreground data-[active=true]:bg-sidebar-accent h-9 gap-2.5 rounded-lg px-3 text-sm font-medium"
            >
              <Link
                href={href}
                className={clsx(isActive && 'font-semibold')}
                onClick={() => {
                  if (isMobile) setOpenMobile(false)
                }}
              >
                <span
                  aria-hidden="true"
                  className={clsx(
                    'size-2 shrink-0 rounded-full',
                    isActive
                      ? 'bg-secondary ring-1 ring-secondary-foreground/60'
                      : 'bg-secondary ring-1 ring-secondary-foreground/20'
                  )}
                />
                <span className="truncate">{group.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </>
  )
}
