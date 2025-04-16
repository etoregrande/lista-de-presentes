'use client'

import {
  CreateWishlistItemFormDataType,
  EditWishlistItemFormDataType,
  WishlistItem,
} from '@/types/wishlistItem'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createWishlistItemFormSchema,
  editWishlistItemFormSchema,
} from '@/schemas/wishlistItem'
import { EmptyWishlist } from './Wishlist-empty'
import { useState } from 'react'
import { Button } from '@/components/ui/button/button'
import { Plus } from 'lucide-react'
import { Session } from '@/lib/auth'
import { WishlistCopyButton } from './Wishlist-copy-button'
import { WishlistItemCard } from './Wishlist-item-card'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { NumericFormat } from 'react-number-format'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WishlistNewButton } from './Wishlist-new-button'

interface WishlistProps {
  userId?: string
  initialWishlist: WishlistItem[]
  session: Session
}

export function Wishlist({ initialWishlist, session }: WishlistProps) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(initialWishlist)
  const isEmpty = wishlist.length === 0
  const formMethods = useForm<EditWishlistItemFormDataType>({
    resolver: zodResolver(editWishlistItemFormSchema),
    defaultValues: {
      isActive: true,
    },
  })
  const {
    register,
    control,
    formState: { errors },
  } = formMethods

  return (
    <>
      <div className="flex justify-between gap-4 pb-4">
        <h2 className="block truncate font-bold md:pt-0">
          Sua lista de presentes
          <span className="block truncate text-sm font-normal text-slate-500">
            Todos os seus presentes cadastrados
          </span>
        </h2>
        <div className="flex items-start gap-2">
          <WishlistCopyButton userId={session.user.id} />
          <FormProvider {...formMethods}>
            <WishlistNewButton setWishlist={setWishlist} />
          </FormProvider>
        </div>
      </div>
      <EmptyWishlist isEmpty={isEmpty} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        {wishlist
          .slice()
          .reverse()
          .map((item) => (
            <WishlistItemCard key={item.id} wishlistItem={item} />
          ))}
      </div>
    </>
  )
}
