'use client'

import { createContext, Dispatch, SetStateAction, useContext } from 'react'
import { SecretSantaGroup } from '@/generated/prisma'

interface SecretSantaGroupsContextType {
  groups: SecretSantaGroup[]
  setGroups: Dispatch<SetStateAction<SecretSantaGroup[]>>
}

export const SecretSantaGroupsContext =
  createContext<SecretSantaGroupsContextType | null>(null)

export function useSecretSantaGroups() {
  const context = useContext(SecretSantaGroupsContext)
  if (!context) {
    throw new Error(
      'useSecretSantaGroups must be used within a SecretSantaGroupsProvider'
    )
  }
  return context
}
