import React from 'react'
import { getSessionOnServer } from '@/server/session'
import { Session } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Page() {
  const session: Session | null = await getSessionOnServer()

  if (!session) redirect('/login')

  return <p>Sua lista de grupos de amigo secreto</p>
}
