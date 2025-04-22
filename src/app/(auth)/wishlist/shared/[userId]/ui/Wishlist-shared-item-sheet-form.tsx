import Image from 'next/image'
import { Dispatch, SetStateAction } from 'react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { WishlistItem } from '@/types/db'
import placeholder from '@/../public/assets/wishlist-item-placeholder.svg'

interface WishlistSharedItemSheetFormProps {
  wishlistItem: Partial<WishlistItem>
  setWishlist: Dispatch<SetStateAction<Partial<WishlistItem>[]>>
  setIsSheetOpen: Dispatch<SetStateAction<boolean>>
}

export const WishlistSharedItemSheetForm = ({
  wishlistItem,
}: WishlistSharedItemSheetFormProps) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-6 p-6">
        <AspectRatio ratio={16 / 9} className="rounded-md bg-purple-50">
          <Image
            src={wishlistItem.image ?? placeholder}
            alt="Imagem do produto"
            fill
            sizes="(max-width: 768px) 100vw, 350px"
            className="rounded-md object-cover"
            priority
          />
        </AspectRatio>

        {wishlistItem.description ? (
          <p className="text-sm break-words">{wishlistItem.description}</p>
        ) : (
          <></>
        )}

        {wishlistItem.link ? (
          <a href={wishlistItem.link} target="_blank">
            Link do produto
          </a>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}
