import { listPublicWishlistItems } from '@/server/wishlistItem'
import { WishlistShared } from './ui/Wishlist-shared'
import { getPublicUserProfile } from '@/lib/repositories/UserRepository'
import { WishlistItem } from '@/types/wishlistItem'
import { getDisplayName, setAvatarFallbackString } from '@/lib/utils'
import { Session } from '@/lib/auth'
import { getSessionOnServer } from '@/server/session'
import { WishlistSharedOwnerWarning } from './ui/Wishlist-shared-owner-warning'
import { Suspense } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { isFollowingUser } from '@/lib/repositories/FollowRepository'
import { FollowButton } from './ui/follow-button'
import { notFound } from 'next/navigation'

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
  const isFollowing =
    session && !isOwner ? await isFollowingUser(session.user.id, userId) : false

  const wishlistOwnerImage = wishlistOwner?.image ?? ''
  if (!wishlistOwner) notFound()

  return (
    <main className="layout-container pb-20 md:pb-24">
      <Suspense fallback="loading">
        <WishlistSharedOwnerWarning isOwner={isOwner}>
          <div>
            <div className="surface-panel mt-6 mb-8 flex flex-col items-start gap-6 bg-[image:var(--gradient)] p-6 sm:flex-row sm:items-center md:mt-10 md:p-10">
              <Avatar className="border-card size-16 border-4 shadow-lg md:size-24">
                <AvatarImage src={wishlistOwnerImage} />
                <AvatarFallback className="bg-card font-bold">
                  <p className="min-w-0 truncate text-2xl">
                    {setAvatarFallbackString(wishlistOwner.name)}
                  </p>
                </AvatarFallback>
              </Avatar>
              <h1 className="page-heading min-w-0 flex-1 break-words">
                <span className="font-lg text-muted-foreground block text-lg font-normal">
                  Lista de presentes de
                </span>
                {getDisplayName(wishlistOwner.name)}
              </h1>
              {!isOwner && (
                <FollowButton
                  key={`${userId}:${isFollowing}`}
                  userId={userId}
                  name={
                    getDisplayName(wishlistOwner.name) ?? wishlistOwner.name
                  }
                  isLoggedIn={Boolean(session)}
                  initialFollowing={isFollowing}
                />
              )}
            </div>

            <WishlistShared initialWishlist={wishlistItems} />
          </div>
        </WishlistSharedOwnerWarning>
      </Suspense>
    </main>
  )
}
