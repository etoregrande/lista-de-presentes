import { Dispatch, SetStateAction, useRef, useState } from 'react'
import Image from 'next/image'
import { WishlistItem } from '@/types/wishlistItem'
import { setImageSrc } from '../actions'
import { WishlistSharedItemCardDetail } from './Wishlist-shared-item-card-detail'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { getDisplayPrice } from '@/lib/utils'

interface WishlistSharedItemCardProps {
  wishlistItem: WishlistItem
  setWishlist: Dispatch<SetStateAction<WishlistItem[]>>
}

export const WishlistSharedItemCard = ({
  wishlistItem,
  setWishlist,
}: WishlistSharedItemCardProps) => {
  const [openedWishlistItem, setOpenedWishlistItem] =
    useState<WishlistItem | null>(null)
  const [openItem, setOpenItem] = useState<boolean>(false)
  const imageSrc = setImageSrc(wishlistItem)
  const ref = useRef<HTMLDivElement>(null)

  const handleOpenWishlistItemCardDetail = () => {
    setOpenedWishlistItem(wishlistItem)
  }

  const cardContent = (
    <motion.div
      ref={ref}
      onClick={handleOpenWishlistItemCardDetail}
      layout="position"
      initial={{ scale: 0.85 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      whileHover={{ y: -2 }}
      whileTap={{ y: 1 }}
      className={clsx(
        'group flex flex-row gap-4 rounded-xl transition-[padding] duration-200 ease-in-out hover:bg-slate-50 md:flex-col md:gap-0',
        wishlistItem.is_purchased && 'cursor-pointer opacity-50'
      )}
    >
      <div className="relative aspect-square h-full min-h-20 min-w-20 overflow-hidden rounded-lg">
        <Image
          src={imageSrc}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
          alt="Imagem do produto"
          className="object-cover transition-transform duration-200 ease-in-out group-hover:scale-102"
          priority
        />
      </div>

      <div className="flex w-auto flex-row justify-between gap-2 overflow-hidden py-2 transition-all duration-200 ease-in-out group-hover:px-2 md:min-h-15">
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate overflow-hidden font-bold tracking-tight">
            {wishlistItem.name}
          </p>
          {typeof wishlistItem.price === 'number' && wishlistItem.price > 0 && (
            <p className="flex-shrink-0 text-sm whitespace-nowrap text-slate-500">
              {getDisplayPrice(wishlistItem.price)}
            </p>
          )}
        </div>

        <div>
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
    </motion.div>
  )

  return (
    <>
      <Sheet open={openItem} onOpenChange={setOpenItem}>
        <SheetTrigger asChild>{cardContent}</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="max-w-[90%] truncate overflow-hidden whitespace-nowrap">
              {wishlistItem.name}
            </SheetTitle>
            <SheetDescription>
              Informações sobre o item que deseja ganhar
            </SheetDescription>
          </SheetHeader>
          {openedWishlistItem && (
            <WishlistSharedItemCardDetail
              wishlistItem={openedWishlistItem}
              setWishlist={setWishlist}
              setOpenedWishlistItem={setOpenedWishlistItem}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
