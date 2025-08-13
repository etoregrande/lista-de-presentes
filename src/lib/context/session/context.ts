'use client'

import { Session } from '@/lib/auth'
import { createContext, useContext } from 'react'

export const SessionContext = createContext<Session | null>(null)

export function useSession() {
  const context = useContext(SessionContext)

  if (!context) {
    throw new Error(
      'useSecretSantaGroups must be used within a SecretSantaGroupsProvider'
    )
  }
  return context
}
