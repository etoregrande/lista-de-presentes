import { listWishlistItems } from '@/server/wishlistItem'
import { WishlistShared } from './ui/Wishlist-shared'
import { getUserById } from '@/lib/repositories/UserRepository'
import { WishlistItem } from '@/generated/prisma'
import { getDisplayName, setAvatarFallbackString } from '@/lib/utils'
import { Session } from '@/lib/auth'
import { getSessionOnServer } from '@/server/session'
import { WishlistSharedOwnerWarning } from './ui/Wishlist-shared-owner-warning'
import { Suspense } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface SharedWishlistParams {
  params: Promise<{ userId: string }>
}

export default async function SharedWishlistPage({
  params,
}: SharedWishlistParams) {
  const { userId } = await params
  const wishlistItems: WishlistItem[] = await listWishlistItems(userId)
  const wishlistOwner = await getUserById(userId)
  const session: Session | null = await getSessionOnServer()
  const isOwner = session?.user.id === userId

  const wishlistOwnerImage = wishlistOwner?.image ?? ''
  if (!wishlistOwner) throw new Error('Error fetching wishlist owner')

  return (
    <main className="layout-container pb-[60dvh] md:pb-[10dvh]">
      <Suspense fallback="loading">
        <WishlistSharedOwnerWarning isOwner={isOwner}>
          <div className="pb-16 lg:pb-0">
            <div className="ml-2 flex items-center gap-6 pt-10 pb-16">
              <Avatar className="outline-foreground size-16 outline-4 outline-offset-4 md:size-24">
                <AvatarImage src={wishlistOwnerImage} />
                <AvatarFallback className="bg-white font-bold">
                  <p className="min-w-0 truncate text-2xl">
                    {setAvatarFallbackString(wishlistOwner.name)}
                  </p>
                </AvatarFallback>
              </Avatar>
              <h1 className="block text-4xl leading-8 font-black tracking-tight break-words">
                <span className="font-lg text-muted-foreground block text-lg font-normal">
                  Lista de presentes de
                </span>
                {getDisplayName(wishlistOwner.name)}
              </h1>
            </div>

            <WishlistShared initialWishlist={wishlistItems} />
          </div>
        </WishlistSharedOwnerWarning>
      </Suspense>
    </main>
  )
}
