'use client'

import { WishlistItem } from "@/types/wishlistItem"
import { setImageSrc, useGetContext } from "../actions"
import { WishlistContext } from "../context/Wishlist-context"
import { Input } from "@/components/ui/input"

interface WishlistItemCardDetailProps {
    wishlistItem: WishlistItem | undefined
}

export const WishlistItemCardDetails = ({ wishlistItem }: WishlistItemCardDetailProps) => {
    if (!wishlistItem) return null

    const { router } = useGetContext(WishlistContext)

    const imageSrc = setImageSrc(wishlistItem)

    return (

        <div
            onClick={() => router.push('/wishlist', { scroll: false })}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md"
            >
                <h2 className="">{wishlistItem?.name}</h2>
                <Input
                    name="name"
                    placeholder=""
                    defaultValue={String(wishlistItem?.name)} />
            </div>
        </div>


    )
}

