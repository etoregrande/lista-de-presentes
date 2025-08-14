'use client'

import { WishlistItemFormData } from '@/types/wishlistItem'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { wishlistItemFormSchema } from '@/schemas/wishlistItem'
import { EmptyWishlist } from './Wishlist-empty'
import { useState } from 'react'
import { Session } from '@/lib/auth'
import { WishlistShareButton } from './Wishlist-share-button'
import { Button } from '@/components/ui/button/button'
import { WishlistNewItemSheet } from './Wishlist-new-item-sheet'
import { Plus } from 'lucide-react'
import { WishlistItemSheet } from './Wishlist-item-sheet'
import { AnimatePresence } from 'framer-motion'
import { WishlistItemSheetTrigger } from './Wishlist-item-sheet-trigger'
import type { WishlistItem } from '@/generated/prisma'
import { SessionProvider } from '@/lib/context/session/provider'

interface WishlistProps {
  userId?: string
  initialWishlist: Partial<WishlistItem>[]
  session: Session
}

export function Wishlist({ initialWishlist, session }: WishlistProps) {
  const [wishlist, setWishlist] = useState(initialWishlist)
  const isEmpty = wishlist.length === 0
  const formMethods = useForm<WishlistItemFormData>({
    resolver: zodResolver(wishlistItemFormSchema),
    defaultValues: {
      isActive: true,
      image: null,
    },
  })

  return (
    <SessionProvider session={session}>
      <div className="flex justify-between gap-4 pb-4">
        <h2 className="block truncate font-bold md:pt-0">
          Sua lista de desejos
          <span className="block truncate text-sm font-normal text-slate-500">
            Todos os seus items cadastrados
          </span>
        </h2>
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
            {wishlist
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
    </SessionProvider>
  )
}
