import { WishlistItem } from '@/types/wishlistItem'
import placeholder from '@/../public/assets/wishlist-item-placeholder.svg'

export const setWishlistItemImageSrc = (wishlistItem: WishlistItem) => {
  const image = wishlistItem.image
  let imageSrc = placeholder
  let isPlaceholder = true

  if (
    typeof image === 'string' &&
    (image.startsWith('http') ||
      image.startsWith('blob:') ||
      image.startsWith('/'))
  ) {
    imageSrc = image
    isPlaceholder = false
  }

  return {
    imageSrc,
    isPlaceholder,
  }
}
