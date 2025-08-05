'use client'

import Link from 'next/link'
import { SidebarMenuButton, SidebarMenuItem } from '../sidebar'
import { SecretSantaGroup } from '@/generated/prisma'

interface AppSidebarSecretSantaGroupsProps {
  groups: SecretSantaGroup[]
}

export const AppSidebarSecretSantaGroups = ({
  groups,
}: AppSidebarSecretSantaGroupsProps) => {
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
