'use client'

import { EmptyWishlist } from './Wishlist-shared-empty'
import { WishlistItem } from '@/types/db'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { WishlistSharedItemSheet } from './Wishlist-shared-item-sheet'
import { WishlistSharedItemSheetTrigger } from './Wishlist-shared-item-sheet-trigger'
import { Separator } from '@/components/ui/separator'

interface WishlistSharedProps {
  initialWishlist: Partial<WishlistItem>[]
}

export function WishlistShared({ initialWishlist }: WishlistSharedProps) {
  const activeWishlist = initialWishlist.filter((item) => item.is_active)
  const [wishlist, setWishlist] =
    useState<Partial<WishlistItem>[]>(activeWishlist)

  const notPurchasedWishlist = wishlist.filter((item) => !item.is_purchased)
  const purchasedWishlist = wishlist.filter((item) => item.is_purchased)
  const isEmpty = wishlist.length === 0 || notPurchasedWishlist.length === 0

  return (
    <>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="block font-bold md:pt-0">Presentes disponíveis</h2>
          <p className="text-muted-foreground block truncate text-sm font-normal">
            Os presentes que ainda não foram comprados
          </p>
        </div>
        {isEmpty ? (
          <EmptyWishlist isEmpty={true} />
        ) : (
          <div className="mb-10 grid grid-cols-1 gap-2 sm:grid-cols-1 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            <AnimatePresence initial={false}>
              {notPurchasedWishlist
                .slice()
                .reverse()
                .map((item) => (
                  <WishlistSharedItemSheet
                    key={item.id}
                    wishlistItem={item}
                    setWishlist={setWishlist}
                  >
                    <WishlistSharedItemSheetTrigger wishlistItem={item} />
                  </WishlistSharedItemSheet>
                ))}
            </AnimatePresence>
          </div>
        )}

        {purchasedWishlist.length != 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="block font-bold md:pt-0">
                Presentes indisponíveis
              </h2>
              <p className="text-muted-foreground block truncate text-sm font-normal">
                Os presentes que ainda já foram comprados
              </p>
            </div>
            <div className="md: mb:gap-4 grid grid-cols-1 gap-2 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence initial={false}>
                {purchasedWishlist
                  .slice()
                  .reverse()
                  .map((item) => (
                    <WishlistSharedItemSheet
                      key={item.id}
                      wishlistItem={item}
                      setWishlist={setWishlist}
                    >
                      <WishlistSharedItemSheetTrigger wishlistItem={item} />
                    </WishlistSharedItemSheet>
                  ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
