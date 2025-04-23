import { listWishlistItems } from '@/server/wishlistItem'
import { WishlistShared } from './ui/Wishlist-shared'
import { getUserById } from '@/lib/repositories/UserRepository'
import { WishlistItem } from '@/types/db'
import { getDisplayName } from '@/lib/utils'
import { Session } from '@/lib/auth'
import { getSessionOnServer } from '@/server/session'
import { WishlistSharedOwnerWarning } from './ui/Wishlist-shared-owner-warning'

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

  if (!wishlistOwner) throw new Error('Error fetching wishlist owner')

  return (
    <WishlistSharedOwnerWarning isOwner={isOwner}>
      <div className="pb-16 lg:pb-0">
        <h1 className="block px-4 pt-10 pb-16 text-4xl leading-8 font-black tracking-tight break-words md:px-8 lg:px-0">
          {getDisplayName(wishlistOwner.name)}
        </h1>
        <div className="px-4 md:px-8 lg:px-0">
          <WishlistShared initialWishlist={wishlistItems} />
        </div>
      </div>
    </WishlistSharedOwnerWarning>
  )
}
