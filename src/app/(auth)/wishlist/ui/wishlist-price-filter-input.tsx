'use client'

import { Input } from '@/components/ui/input'
import { WishlistItem } from '@/generated/prisma'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface WishlistPriceFilterInputProps {
  wishlist: WishlistItem[]
  setFilteredWishlist: (items: WishlistItem[]) => void
}

export function WishlistPriceFilterInput({
  wishlist,
  setFilteredWishlist,
}: WishlistPriceFilterInputProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [priceLimit, setPriceLimit] = useState<number | ''>('')

  useEffect(() => {
    const priceParam = searchParams.get('priceLimit')
    if (priceParam) {
      setPriceLimit(Number(priceParam))
    } else {
      setPriceLimit('')
    }
  }, [searchParams])

  const handleSearch = (value: number | '') => {
    setPriceLimit(value)

    const params = new URLSearchParams(searchParams.toString())
    if (value !== '') {
      params.set('price', value.toString())
    } else {
      params.delete('price')
    }
    router.replace(`${pathname}?${params.toString()}`)

    const filtered = wishlist.filter(
      (item) => value === '' || (item.price ?? 0) <= value
    )
    setFilteredWishlist(filtered)
  }

  return (
    <Input
      type="number"
      placeholder="Limite de preço"
      value={priceLimit === '' ? '' : priceLimit}
      onChange={(e) => {
        const val = e.target.value
        handleSearch(val === '' ? '' : Number(val))
      }}
    />
  )
}
