import React from 'react'
import { Wishlist } from './ui/Wishlist'
import { listWishlistItems } from '@/server/wishlistItem'
import { getSessionOnServer } from '@/server/session'
import { Session } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { WishlistBackground } from './ui/Wishlist-background'

export default async function Page() {
  const wishlistItems = await listWishlistItems()
  const session: Session | null = await getSessionOnServer()

  if (!session) redirect('/login')

  return (
    <div className="layout-container w-full py-0 md:py-10">
      <WishlistBackground />
      <Wishlist initialWishlist={wishlistItems} session={session} />
    </div>
  )
}
