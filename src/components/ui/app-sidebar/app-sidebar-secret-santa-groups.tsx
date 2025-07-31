'use client'

import { listSecretSantaGroups } from '@/server/secretSantaGroup'
import Link from 'next/link'
import { SidebarMenuButton, SidebarMenuItem } from '../sidebar'
import { Session } from '@/lib/auth'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { SecretSantaGroup, UserSecretSantaGroup } from '@/generated/prisma'

interface AppSidebarSecretSantaGroupsProps {
  session: Session
  groups: SecretSantaGroup[]
  setGroups: Dispatch<SetStateAction<SecretSantaGroup[]>>
}

export const AppSidebarSecretSantaGroups = ({
  session,
  groups,
  setGroups,
}: AppSidebarSecretSantaGroupsProps) => {
  useEffect(() => {
    const loadGroups = async () => {
      const secretSantaGroups = await listSecretSantaGroups(session.user.id)
      console.log('Grupos =>', secretSantaGroups)
      setGroups(secretSantaGroups)
    }
    loadGroups()
  }, [session.user.id, setGroups])

  return (
    <>
      {groups.map((group) => {
        return (
          <SidebarMenuItem key={group.id}>
            <SidebarMenuButton asChild>
              <Link href={`/groups/${group.id}`}>{group.name}</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </>
  )
}
