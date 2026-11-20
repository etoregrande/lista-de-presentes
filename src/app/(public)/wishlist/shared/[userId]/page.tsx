import { listPublicWishlistItems } from '@/server/wishlistItem'
import { WishlistShared } from './ui/Wishlist-shared'
import { getPublicUserProfile } from '@/lib/repositories/UserRepository'
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
  const wishlistItems: WishlistItem[] = await listPublicWishlistItems(userId)
  const wishlistOwner = await getPublicUserProfile(userId)
  const session: Session | null = await getSessionOnServer()
  const isOwner = session?.user.id === userId

  const wishlistOwnerImage = wishlistOwner?.image ?? ''
  if (!wishlistOwner) throw new Error('Error fetching wishlist owner')

  return (
    <main className="layout-container pb-20 md:pb-24">
      <Suspense fallback="loading">
        <WishlistSharedOwnerWarning isOwner={isOwner}>
          <div>
            <div className="surface-panel mt-6 mb-8 flex items-center gap-6 bg-[image:var(--gradient)] p-6 md:mt-10 md:p-10">
              <Avatar className="border-card size-16 border-4 shadow-lg md:size-24">
                <AvatarImage src={wishlistOwnerImage} />
                <AvatarFallback className="bg-card font-bold">
                  <p className="min-w-0 truncate text-2xl">
                    {setAvatarFallbackString(wishlistOwner.name)}
                  </p>
                </AvatarFallback>
              </Avatar>
              <h1 className="page-heading min-w-0 break-words">
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
