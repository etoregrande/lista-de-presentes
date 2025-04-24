import React from 'react'
import { Wishlist } from './ui/Wishlist'
import { listWishlistItems } from '@/server/wishlistItem'
import { getSessionOnServer } from '@/server/session'
import { Session } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { WishlistItem } from '@/types/db'
import Image from 'next/image'

export default async function Page() {
  const wishlistItems: WishlistItem[] = await listWishlistItems()
  const session: Session | null = await getSessionOnServer()

  if (!session) redirect('/login')

  return (
    <div className="bg-white px-4 pt-8 pb-16 outline-20 outline-white md:px-8 lg:px-0 lg:pb-0">
      <Wishlist initialWishlist={wishlistItems} session={session} />
    </div>
  )
}
