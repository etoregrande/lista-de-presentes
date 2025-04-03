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

interface WishlistProps {
    userId?: string,
    initialWishlist: WishlistItem[]
}

export function Wishlist({ initialWishlist }: WishlistProps) {
    const formHook = useForm<CreateWishlistItemFormDataType>({
        resolver: zodResolver(createWishlistItemFormSchema),
        defaultValues: {
            name: "",
            description: "",
            price: null,
            image: null,
            link: "",
            priority: "normal",
        }
    });

    const isEmpty = initialWishlist.length === 0;

    return (
        <>
            <WishlistContextProvider>
                <FormProvider {...formHook}>
                    <CreateWishlistItemButton />
                    <EmptyWishlist isEmpty={isEmpty} />
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
                </FormProvider>
            </WishlistContextProvider>
        </>
    );
}
