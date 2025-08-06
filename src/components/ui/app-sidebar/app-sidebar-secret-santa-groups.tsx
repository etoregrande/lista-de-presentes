'use client'

import Link from 'next/link'
import { SidebarMenuButton, SidebarMenuItem } from '../sidebar'
import { useSecretSantaGroups } from '@/lib/context/secretSantaGroups/context'

export const AppSidebarSecretSantaGroups = () => {
  const { groups } = useSecretSantaGroups()

  return (
    <>
      {groups.map((group) => {
        return (
          <SidebarMenuItem key={group.slug}>
            <SidebarMenuButton asChild>
              <Link href={`/groups/${group.slug}`}>{group.name}</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </>
  )
}
