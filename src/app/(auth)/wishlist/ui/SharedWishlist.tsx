'use client'

import { WishlistItemCard } from "./WishlistItemCard";
import { EmptyWishlist } from "./EmptyWishlist";
import { WishlistItem } from "@/types/wishlistItem";

interface WishlistProps {
    initialWishlist: WishlistItem[]
}

export function SharedWishlist({ initialWishlist }: WishlistProps) {
    const isEmpty = initialWishlist.length === 0;

    return (
        <>
            <EmptyWishlist isEmpty={isEmpty} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"  >
                {initialWishlist
                    .slice()
                    .reverse()
                    .map((wishlistItem) => <WishlistItemCard key={wishlistItem.id}{...wishlistItem} />
                    )}
            </div>
        </>
    );
}
