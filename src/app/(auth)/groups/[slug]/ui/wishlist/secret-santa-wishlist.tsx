import { WishlistItem } from '@/generated/prisma'
import { SecretSantaWishlistItem } from './secret-santa-wishlist-item'

interface SecretSantaWishlistProps {
  items: WishlistItem[]
  maxItems?: number
}

export const SecretSantaWishlist = ({
  items,
  maxItems,
}: SecretSantaWishlistProps) => {
  const wishlistItems = maxItems ? items.slice(0, maxItems) : items

  return (
    <>
      {wishlistItems.map((item) => (
        <SecretSantaWishlistItem key={item.id} wishlistItem={item} />
      ))}
    </>
  )
}
