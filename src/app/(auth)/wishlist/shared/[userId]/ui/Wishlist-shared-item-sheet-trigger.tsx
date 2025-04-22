import Image from 'next/image'
import clsx from 'clsx'
import { getDisplayPrice } from '@/lib/utils'
import { WishlistItem } from '@/types/db'
import { motion } from 'framer-motion'
import placeholder from '@/../public/assets/wishlist-item-placeholder.svg'

interface WishlistSharedItemSheetTriggerProps {
  wishlistItem: Partial<WishlistItem>
}

export const WishlistSharedItemSheetTrigger = ({
  wishlistItem,
}: WishlistSharedItemSheetTriggerProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: wishlistItem.is_purchased ? 0.4 : 1,
        scale: 1,
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.2,
        layout: { type: 'spring', stiffness: 300, damping: 24 },
      }}
      className={clsx(
        'group hover:bg-primary-foreground flex flex-row gap-4 rounded-xl transition-[padding] duration-200 ease-in-out md:flex-col md:gap-0',
        wishlistItem.is_purchased && 'cursor-pointer opacity-50'
      )}
    >
      <div className="bg-secondary-foreground hover:bg-primary-foreground relative aspect-square h-full min-h-20 min-w-20 overflow-hidden rounded-lg">
        <Image
          src={wishlistItem.image ?? placeholder}
          fill
          alt="Imagem do produto"
          sizes="(max-width: 768px) 100vw, 350px"
          className={clsx(
            'transition-transform duration-200 ease-in-out group-hover:scale-102',
            wishlistItem.image && 'object-cover'
          )}
          priority
        />
      </div>

      <div className="flex w-full flex-row justify-between gap-4 overflow-hidden py-2 transition-all duration-200 ease-in-out group-hover:px-2 md:min-h-15">
        <div className="flex min-w-0 flex-col justify-center text-left md:justify-start">
          <p className="truncate font-bold tracking-tight">
            {wishlistItem.name}
          </p>
          {typeof wishlistItem.price === 'number' && wishlistItem.price > 0 && (
            <p className="flex-shrink-0 text-sm whitespace-nowrap text-slate-500">
              {getDisplayPrice(wishlistItem.price)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
