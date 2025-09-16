'use client'

import { Session } from '@/lib/auth'
import { createContext, useContext } from 'react'

export const SessionContext = createContext<Session | null>(null)

export function useSession() {
  const context = useContext(SessionContext)

  return context
}
