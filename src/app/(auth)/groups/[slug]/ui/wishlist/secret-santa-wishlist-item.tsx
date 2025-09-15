'use client'

import { WishlistItem } from '@/generated/prisma'
import clsx from 'clsx'
import Image from 'next/image'
import placeholder from '@/../public/assets/wishlist-item-placeholder.svg'
import { getDisplayPrice } from '@/lib/utils'

interface SecretSantaWishlistItemProps {
  wishlistItem: WishlistItem
}

export const SecretSantaWishlistItem = ({
  wishlistItem,
}: SecretSantaWishlistItemProps) => {
  return (
    <div
      className={clsx(
        'group flex min-w-0 flex-row gap-4 rounded-xl bg-white transition-[padding] duration-200 ease-in-out md:flex-col md:gap-0'
      )}
    >
      <div className="bg-secondary-foreground relative aspect-square h-full min-h-22 min-w-22 overflow-hidden rounded-lg">
        <Image
          src={wishlistItem.image ?? placeholder}
          fill
          alt="Imagem do produto"
          sizes="(max-width: 768px) 100vw, 350px"
          className={clsx(
            'transition-transform duration-200 ease-in-out',
            wishlistItem.image && 'object-cover'
          )}
          priority
        />
      </div>

      <div className="flex w-full min-w-0 flex-row justify-between gap-4 overflow-hidden py-2 transition-all duration-200 ease-in-out md:min-h-15">
        <div className="flex min-w-0 flex-col justify-center text-left md:justify-start">
          <p className="min-w-0 truncate font-bold tracking-tight">
            {wishlistItem.name}
          </p>
          {typeof wishlistItem.price === 'number' && wishlistItem.price > 0 && (
            <p className="flex-shrink-0 text-sm whitespace-nowrap text-slate-500">
              {getDisplayPrice(wishlistItem.price)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
