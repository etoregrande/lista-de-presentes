'use client'

import { createContext, useContext } from 'react'
import { SecretSantaGroup, User } from '@/generated/prisma'

interface SecretSantaGroupsContextType {
  secretSantaGroup: SecretSantaGroup
  participants: Partial<User>[]
}

export const SecretSantaGroupContext =
  createContext<SecretSantaGroupsContextType | null>(null)

export function useSecretSantaGroup() {
  const context = useContext(SecretSantaGroupContext)
  if (!context) {
    throw new Error(
      'useSecretSantaGroup must be used within a SecretSantaGroupProvider'
    )
  }
  return context
}
