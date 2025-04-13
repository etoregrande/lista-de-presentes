'use client'

import { EmptyWishlist } from "./Wishlist-shared-empty";
import { WishlistItem } from "@/types/wishlistItem";
import { useState } from "react";
import { WishlistSharedItemCard } from "./Wishlist-shared-item-card";

interface WishlistSharedProps {
    initialWishlist: WishlistItem[]
}

export function WishlistShared({ initialWishlist }: WishlistSharedProps) {
    const activeWishlist = initialWishlist.filter(item => item.is_active)
    const [wishlist, setWishlist] = useState<WishlistItem[]>(activeWishlist)

    const notPurchasedWishlist = wishlist.filter(item => !item.is_purchased)
    const purchasedWishlist = wishlist.filter(item => item.is_purchased)
    const isEmpty = wishlist.length === 0 || notPurchasedWishlist.length === 0;

    return (
        <>

            <div className="flex flex-col gap-4">
                <div className="px-4 py-4 bg-slate-100 lg:rounded-2xl">
                    <h2 className="block font-bold md:pt-0 pb-4">Produtos disponíveis
                        <span className="truncate block text-sm font-normal text-slate-500">
                            Os presentes que ainda não foram comprados
                        </span>
                    </h2>
                    {isEmpty ? (
                        <EmptyWishlist isEmpty={true} />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {notPurchasedWishlist
                                .slice()
                                .reverse()
                                .map((wishlistItem) => <WishlistSharedItemCard
                                    key={wishlistItem.id}
                                    wishlistItem={wishlistItem}
                                    setWishlist={setWishlist}
                                />
                                )}
                        </div>
                    )}
                </div>

                {purchasedWishlist.length != 0 &&
                    <div className="px-4 py-4 bg-slate-100 md:rounded-2xl">
                        <h2 className="block font-bold md:pt-0 pb-4">Produtos indisponíveis
                            <span className="truncate block text-sm font-normal text-slate-500">
                                Os presentes que já foram comprados
                            </span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4" >
                            {purchasedWishlist
                                .slice()
                                .reverse()
                                .map((wishlistItem) => <WishlistSharedItemCard
                                    key={wishlistItem.id}
                                    wishlistItem={wishlistItem}
                                    setWishlist={setWishlist}
                                />
                                )}
                        </div>
                    </div>
                }
            </div >
        </>
    );
}
