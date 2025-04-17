'use client'

import { EditWishlistItemFormDataType } from '@/types/wishlistItem'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { editWishlistItemFormSchema } from '@/schemas/wishlistItem'
import { EmptyWishlist } from './Wishlist-empty'
import { useState } from 'react'
import { Session } from '@/lib/auth'
import { WishlistCopyButton } from './Wishlist-copy-button'
import { WishlistItem } from '@/types/db'
import { Button } from '@/components/ui/button/button'
import { WishlistNewItem } from './Wishlist-new-item'
import { Plus } from 'lucide-react'
import { WishlistItemSheet } from './Wishlist-item-sheet'
import { AnimatePresence, motion } from 'framer-motion'

interface WishlistProps {
  userId?: string
  initialWishlist: Partial<WishlistItem>[]
  session: Session
}

export function Wishlist({ initialWishlist, session }: WishlistProps) {
  const [wishlist, setWishlist] =
    useState<Partial<WishlistItem>[]>(initialWishlist)
  const isEmpty = wishlist.length === 0
  const formMethods = useForm<EditWishlistItemFormDataType>({
    resolver: zodResolver(editWishlistItemFormSchema),
    defaultValues: {
      isActive: true,
    },
  })

  return (
    <>
      <div className="flex justify-between gap-4 pb-4">
        <h2 className="block truncate font-bold md:pt-0">
          Sua lista de presentes
          <span className="block truncate text-sm font-normal text-slate-500">
            Todos os seus presentes cadastrados
          </span>
        </h2>
        <div className="flex items-start justify-end gap-2">
          <WishlistCopyButton className="" userId={session.user.id} />
          <FormProvider {...formMethods}>
            <WishlistNewItem setWishlist={setWishlist}>
              <Button
                className="flex items-center gap-2 px-2 md:px-4 md:py-2"
                size="icontext"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">Novo item</span>
              </Button>
            </WishlistNewItem>
          </FormProvider>
        </div>
      </div>
      <EmptyWishlist isEmpty={isEmpty} />
      <AnimatePresence>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
          {wishlist
            .slice()
            .reverse()
            .map((item) => (
              <WishlistItemSheet
                key={item.id}
                wishlistItem={item}
                setWishlist={setWishlist}
              />
            ))}
        </div>
      </AnimatePresence>
    </>
  )
}
