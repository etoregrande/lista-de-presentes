import React from 'react'
import { Wishlist } from './ui/Wishlist'
import { listWishlistItems } from '@/server/wishlistItem'
import { getSessionOnServer } from '@/server/session'
import { Session } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { WishlistBackground } from './ui/Wishlist-background'
import { isIntegrationAdmin } from '@/lib/mercadolivre/oauth'

export default async function Page() {
  const wishlistItems = await listWishlistItems()
  const session: Session | null = await getSessionOnServer()

  if (!session) redirect('/login')

  return (
    <main className="layout-container relative w-full py-6 pb-20 md:py-10 md:pb-24">
      <WishlistBackground />
      <Wishlist
        initialWishlist={wishlistItems}
        session={session}
        integrationAdmin={isIntegrationAdmin(session.user.email)}
      />
    </main>
  )
}
