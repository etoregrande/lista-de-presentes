'use client'

import { WishlistItemFormData } from '@/types/wishlistItem'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { wishlistItemFormSchema } from '@/schemas/wishlistItem'
import { EmptyWishlist } from './Wishlist-empty'
import { useMemo, useState } from 'react'
import { Session } from '@/lib/auth'
import { WishlistShareButton } from './Wishlist-share-button'
import { Button } from '@/components/ui/button'
import { WishlistNewItemSheet } from './Wishlist-new-item-sheet'
import { Plus } from 'lucide-react'
import { WishlistItemSheet } from './Wishlist-item-sheet'
import { AnimatePresence } from 'framer-motion'
import { WishlistItemSheetTrigger } from './Wishlist-item-sheet-trigger'
import type { WishlistItem } from '@/generated/prisma'
import { SessionProvider } from '@/lib/context/session/provider'
import { Input } from '@/components/ui/input'
import { useSearchParams } from 'next/navigation'
import { NumericFormat } from 'react-number-format'
import { InputWrapper } from '@/components/ui/form/form-input-wrapper'
import { Label } from '@/components/ui/label'

interface WishlistProps {
  userId?: string
  initialWishlist: WishlistItem[]
  session: Session
}

export function Wishlist({ initialWishlist, session }: WishlistProps) {
  const [wishlist, setWishlist] = useState(initialWishlist)
  const searchParams = useSearchParams()
  const formMethods = useForm<WishlistItemFormData>({
    resolver: zodResolver(wishlistItemFormSchema),
    defaultValues: {
      isActive: true,
      image: null,
    },
  })

  const rawPriceLimit = searchParams.get('priceLimit')
  const priceLimitParam = rawPriceLimit ? Number(rawPriceLimit) : null

  const filteredWishlist = useMemo(() => {
    if (!priceLimitParam) return wishlist
    return wishlist.filter((item) => (item.price ?? 0) <= priceLimitParam * 100)
  }, [wishlist, priceLimitParam])

  const isEmpty = wishlist.length === 0

  return (
    <SessionProvider session={session}>
      <div className="flex flex-col gap-8">
        <h2 className="block truncate text-2xl font-extrabold md:pt-0">
          Sua lista de desejos
          <span className="block truncate text-base font-normal text-slate-500">
            Todos os seus items cadastrados
          </span>
        </h2>

        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-6">
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

            <div className="flex items-start justify-end gap-2">
              <WishlistShareButton />
              <FormProvider {...formMethods}>
                <WishlistNewItemSheet setWishlist={setWishlist}>
                  <Button
                    className="flex items-center gap-2 px-2 md:px-4 md:py-2"
                    size="icontext"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden md:inline">Novo item</span>
                  </Button>
                </WishlistNewItemSheet>
              </FormProvider>
            </div>
          </div>

          <EmptyWishlist isEmpty={isEmpty} />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-1 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            <FormProvider {...formMethods}>
              <AnimatePresence initial={false}>
                {filteredWishlist
                  .slice()
                  .reverse()
                  .map((item) => (
                    <WishlistItemSheet
                      key={item.id}
                      wishlistItem={item}
                      setWishlist={setWishlist}
                    >
                      <WishlistItemSheetTrigger wishlistItem={item} />
                    </WishlistItemSheet>
                  ))}
              </AnimatePresence>
            </FormProvider>
          </div>
        </section>
      </div>
    </SessionProvider>
  )
}
