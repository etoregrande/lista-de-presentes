import Image from 'next/image'
import { WishlistItem } from '@/types/wishlistItem'
import { setWishlistItemImageSrc } from '../actions'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import clsx from 'clsx'

import { getDisplayPrice } from '@/lib/utils'

interface WishlistItemCardProps {
  wishlistItem: WishlistItem
}

export const WishlistItemCard = ({ wishlistItem }: WishlistItemCardProps) => {
  const { imageSrc, isPlaceholder } = setWishlistItemImageSrc(wishlistItem)
  return (
    <div
      className={clsx(
        'group hover:bg-secondary-foreground flex flex-row gap-4 rounded-xl transition-[padding] duration-200 ease-in-out md:flex-col md:gap-0',
        !wishlistItem.is_active && 'cursor-pointer opacity-50'
      )}
    >
      <div className="bg-secondary-foreground relative aspect-square h-full min-h-20 min-w-20 overflow-hidden rounded-lg">
        <Image
          src={imageSrc}
          fill
          alt="Imagem do produto"
          className={clsx(
            'transition-transform duration-200 ease-in-out group-hover:scale-102',
            !isPlaceholder && 'object-cover',
            isPlaceholder && 'object-contain'
          )}
          priority
        />
      </div>

      <div className="flex w-full flex-row justify-between gap-4 overflow-hidden py-2 transition-all duration-200 ease-in-out group-hover:px-2 md:min-h-15">
        <div className="flex min-w-0 flex-col justify-center md:justify-start">
          <p className="truncate font-bold tracking-tight">
            {wishlistItem.name}
          </p>
          {typeof wishlistItem.price === 'number' && wishlistItem.price > 0 && (
            <p className="flex-shrink-0 text-sm whitespace-nowrap text-slate-500">
              {getDisplayPrice(wishlistItem.price)}
            </p>
          )}
        </div>

        {!wishlistItem.is_active && (
          <div className="flex items-center gap-1">
            <p className="text-red-500">Invisível</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="cursor-pointer text-red-500" size={20} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Este produto não vai aparecer na sua lista compartilhada
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  )
}
