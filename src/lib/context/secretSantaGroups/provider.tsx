'use client'

import { SecretSantaGroup } from '@/generated/prisma'
import { SecretSantaGroupsContext } from '@/lib/context/secretSantaGroups/context'
import { useState } from 'react'

interface SecretSantaGroupsProviderProps {
  children: React.ReactNode
  initialGroups: SecretSantaGroup[]
}

export function SecretSantaGroupsProvider({
  children,
  initialGroups,
}: SecretSantaGroupsProviderProps) {
  const [groups, setGroups] = useState<SecretSantaGroup[]>(initialGroups)

  return (
    <SecretSantaGroupsContext.Provider value={{ groups, setGroups }}>
      {children}
    </SecretSantaGroupsContext.Provider>
  )
}
