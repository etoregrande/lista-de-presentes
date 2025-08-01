'use client'

import { SecretSantaGroup } from '@/generated/prisma'
import { SecretSantaGroupsContext } from '@/lib/context/secretSantaGroups/context'

export function SecretSantaGroupsProvider({
  children,
  groups,
}: {
  children: React.ReactNode
  groups: SecretSantaGroup[]
}) {
  return (
    <SecretSantaGroupsContext.Provider value={groups}>
      {children}
    </SecretSantaGroupsContext.Provider>
  )
}
