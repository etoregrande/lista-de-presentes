'use client'

import { SecretSantaGroup, User } from '@/generated/prisma'
import { SecretSantaGroupContext } from './context'
import { ReactNode, useState } from 'react'

export function SecretSantaGroupProvider({
  secretSantaGroup,
  initialParticipants,
  isOwner,
  children,
}: {
  secretSantaGroup: SecretSantaGroup
  initialParticipants: Partial<User>[]
  isOwner: boolean
  children: ReactNode
}) {
  const [participants, setParticipants] =
    useState<Partial<User>[]>(initialParticipants)

  return (
    <SecretSantaGroupContext.Provider
      value={{ secretSantaGroup, participants, setParticipants, isOwner }}
    >
      {children}
    </SecretSantaGroupContext.Provider>
  )
}
