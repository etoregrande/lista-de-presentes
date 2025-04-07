'use client'

import { WishlistItemCard } from "./Wishlist-item-card";
import { EmptyWishlist } from "./Wishlist-empty";
import { WishlistItem } from "@/types/wishlistItem";

interface WishlistProps {
    initialWishlist: WishlistItem[]
}

export function SharedWishlist({ initialWishlist }: WishlistProps) {
    const activeWishlist = initialWishlist.filter(item => item.is_active)
    const isEmpty = activeWishlist.length === 0;

    return (
        <>
            <EmptyWishlist isEmpty={isEmpty} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"  >
                {activeWishlist
                    .slice()
                    .reverse()
                    .map((wishlistItem) => <WishlistItemCard
                        key={wishlistItem.id}
                        wishlistItem={wishlistItem}
                        mode="view"
                    />
                    )}
            </div>
        </>
    );
}
