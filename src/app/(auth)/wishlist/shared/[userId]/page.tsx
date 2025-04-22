import { listWishlistItems } from '@/server/wishlistItem'
import { WishlistShared } from './ui/Wishlist-shared'
import { getUserById } from '@/lib/repositories/UserRepository'
import { WishlistItem } from '@/types/db'

interface SharedWishlistParams {
  params: Promise<{ userId: string }>
}

export default async function SharedWishlistPage({
  params,
}: SharedWishlistParams) {
  const { userId } = await params
  const wishlistItems: WishlistItem[] = await listWishlistItems(userId)
  const wishlistOwner = await getUserById(userId)
  if (!wishlistOwner) throw new Error('Error fetching wishlist owner')

  return (
    <>
      <div className="pt-8 pb-16 lg:pb-0">
        <h1 className="block truncate px-4 pb-8 text-[var(--muted-foreground)] md:px-8 lg:px-0">
          Você está vendo a lista de presentes de
          <span className="block truncate text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {wishlistOwner.name}
          </span>
        </h1>
        <WishlistShared initialWishlist={wishlistItems} />
      </div>
    </>
  )
}
