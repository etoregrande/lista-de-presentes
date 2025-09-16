'use client'

import { Session } from '@/lib/auth'
import { SessionContext } from './context'
import { ReactNode } from 'react'

interface SessionProviderProps {
  session: Session | null
  children: ReactNode
}

export const SessionProvider = ({
  session,
  children,
}: SessionProviderProps) => {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  )
}
