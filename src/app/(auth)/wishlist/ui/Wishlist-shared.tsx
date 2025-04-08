'use client'

import { WishlistItemCard } from "./Wishlist-item-card";
import { EmptyWishlist } from "./Wishlist-empty";
import { WishlistItem } from "@/types/wishlistItem";
import { useState } from "react";

interface WishlistProps {
    initialWishlist: WishlistItem[]
}

export function SharedWishlist({ initialWishlist }: WishlistProps) {
    const activeWishlist = initialWishlist.filter(item => item.is_active)
    const [wishlist, setWishlist] = useState<WishlistItem[]>(activeWishlist)
    const isEmpty = wishlist.length === 0;

    const notPurchasedWishlist = wishlist.filter(item => !item.is_purchased)
    const purchasedWishlist = wishlist.filter(item => item.is_purchased)

    return (
        <>
            <EmptyWishlist isEmpty={isEmpty} />
            <h2 className="mb-4">Produtos disponíveis</h2>
            {notPurchasedWishlist.length != 0 ?
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"  >
                        {notPurchasedWishlist
                            .slice()
                            .reverse()
                            .map((wishlistItem) => <WishlistItemCard
                                key={wishlistItem.id}
                                wishlistItem={wishlistItem}
                                setWishlist={setWishlist}
                                mode="view"
                            />
                            )}
                    </div>
                </>
                :
                <div className="p-10 flex justify-center items-center bg-violet-200 h-40 rounded-lg">
                    <p>Parece que a lista não tem mais items disponíveis para compra</p>
                </div>
            }

            {purchasedWishlist.length != 0 &&
                <>
                    <h2 className="mb-4 mt-10">Produtos que já foram comprados</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"  >
                        {purchasedWishlist
                            .slice()
                            .reverse()
                            .map((wishlistItem) => <WishlistItemCard
                                key={wishlistItem.id}
                                wishlistItem={wishlistItem}
                                setWishlist={setWishlist}
                                mode="view"
                            />
                            )}
                    </div>
                </>
            }
        </>
    );
}
