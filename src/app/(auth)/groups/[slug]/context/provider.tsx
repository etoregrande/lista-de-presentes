// GroupProvider.tsx
'use client'
import { SecretSantaGroup, User } from '@/generated/prisma'
import { SecretSantaGroupContext } from './context'
import { ReactNode } from 'react'

export function SecretSantaGroupProvider({
  secretSantaGroup,
  participants,
  children,
}: {
  secretSantaGroup: SecretSantaGroup
  participants: Partial<User>[]
  children: ReactNode
}) {
  return (
    <SecretSantaGroupContext.Provider
      value={{ secretSantaGroup, participants }}
    >
      {children}
    </SecretSantaGroupContext.Provider>
  )
}
