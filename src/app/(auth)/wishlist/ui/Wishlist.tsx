'use client'

import { CreateWishlistItemFormDataType, WishlistItem } from "@/types/wishlistItem";
import { FormProvider, useForm } from "react-hook-form";
import { WishlistItemCard } from "./Wishlist-item-card";
import { WishlistItemCardForm } from "./Wishlist-item-card-form";
import { WishlistContextProvider } from "../context/Wishlist-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWishlistItemFormSchema } from "@/schemas/wishlistItem";
import { CreateWishlistItemButton } from "./Create-wishlist-item-button";
import { EmptyWishlist } from "./Wishlist-empty";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { WishlistItemCardDetails } from "./Wishlist-item-card-details";

interface WishlistProps {
    userId?: string,
    initialWishlist: WishlistItem[]
}

export function Wishlist({ initialWishlist }: WishlistProps) {
    const searchParams = useSearchParams()
    const itemId = searchParams.get("item")
    const isEmpty = initialWishlist.length === 0;
    const openedWishlistItem = initialWishlist.find((wishlistItem) => wishlistItem.id === itemId)

    const formHook = useForm<CreateWishlistItemFormDataType>({
        resolver: zodResolver(createWishlistItemFormSchema),
    });

    useEffect(() => {
        if (itemId) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }

        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [itemId]);


    return (
        <>
            <WishlistContextProvider>
                <FormProvider {...formHook}>
                    <WishlistItemCardDetails wishlistItem={openedWishlistItem} />
                    <CreateWishlistItemButton />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"  >
                        <WishlistItemCardForm />
                        {initialWishlist
                            .slice()
                            .reverse()
                            .map((wishlistItem) =>
                                <WishlistItemCard
                                    key={wishlistItem.id}
                                    wishlistItem={wishlistItem}
                                />
                            )}
                    </div>
                    <EmptyWishlist isEmpty={isEmpty} />
                </FormProvider>
            </WishlistContextProvider>
        </>
    );
}
