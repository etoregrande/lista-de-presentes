'use client'

import { EmptyWishlist } from './Wishlist-shared-empty'
import { WishlistItem } from '@/generated/prisma'
import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { WishlistSharedItemSheet } from './Wishlist-shared-item-sheet'
import { WishlistSharedItemSheetTrigger } from './Wishlist-shared-item-sheet-trigger'
import { InputWrapper } from '@/components/ui/form/form-input-wrapper'
import { Label } from '@/components/ui/label'
import { NumericFormat } from 'react-number-format'
import { Input } from '@/components/ui/input'
import { useSearchParams } from 'next/navigation'

interface WishlistSharedProps {
  initialWishlist: Partial<WishlistItem>[]
}

export function WishlistShared({ initialWishlist }: WishlistSharedProps) {
  const activeWishlist = initialWishlist.filter((item) => item.isActive)
  const searchParams = useSearchParams()

  const [wishlist, setWishlist] =
    useState<Partial<WishlistItem>[]>(activeWishlist)

  const rawPriceLimit = searchParams.get('priceLimit')
  const priceLimitParam = rawPriceLimit ? Number(rawPriceLimit) : null

  const notPurchasedWishlist = useMemo(() => {
    return wishlist.filter((item) => {
      if (item.isPurchased) return false
      if (!priceLimitParam) return true
      return (item.price ?? 0) <= priceLimitParam * 100
    })
  }, [wishlist, priceLimitParam])

  const purchasedWishlist = wishlist.filter((item) => item.isPurchased)
  const isEmpty = wishlist.length === 0 || notPurchasedWishlist.length === 0

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <InputWrapper>
            <Label htmlFor="priceLimit">Valor do presente</Label>
            <NumericFormat
              name="priceLimit"
              thousandSeparator="."
              decimalSeparator=","
              decimalScale={2}
              fixedDecimalScale
              prefix="R$ "
              allowNegative={false}
              value={priceLimitParam || ''}
              placeholder="Limite de preço"
              customInput={Input}
              onValueChange={({ floatValue }) => {
                const params = new URLSearchParams(searchParams.toString())

                if (floatValue !== undefined) {
                  // Atualiza o searchParam em reais
                  params.set('priceLimit', floatValue.toString())
                } else {
                  params.delete('priceLimit')
                }

                window.history.replaceState(null, '', `?${params.toString()}`)
              }}
              className="max-w-60"
            />
          </InputWrapper>
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
                  Os presentes que já foram comprados
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
      </div>
    </>
  )
}
