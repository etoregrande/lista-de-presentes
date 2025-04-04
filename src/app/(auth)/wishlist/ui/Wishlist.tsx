'use client'

import { CreateWishlistItemFormDataType, Priority, WishlistItem } from "@/types/wishlistItem";
import { FormProvider, useForm } from "react-hook-form";
import { WishlistItemCard } from "./Wishlist-item-card";
import { WishlistItemCardForm } from "./Wishlist-item-card-form";
import { WishlistContextProvider } from "../context/Wishlist-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWishlistItemFormSchema } from "@/schemas/wishlistItem";
import { CreateWishlistItemButton } from "./Create-wishlist-item-button";
import { EmptyWishlist } from "./Wishlist-empty";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { WishlistItemCardDetails } from "./Wishlist-item-card-details";

interface WishlistProps {
    userId?: string,
    initialWishlist: WishlistItem[]
}

export function Wishlist({ initialWishlist }: WishlistProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const itemId = searchParams.get("item")
    const isEmpty = initialWishlist.length === 0;
    const openedWishlistItem = initialWishlist.find((wishlistItem) => wishlistItem.id === itemId)
    const priorityOrder: Record<Priority, number> = {
        alta: 0,
        normal: 1,
        baixa: 2,
    };

    const sortedWishlist = initialWishlist.slice().sort((a, b) => {
        return priorityOrder[a.priority as Priority] - priorityOrder[b.priority as Priority];
    });

    const formHook = useForm<CreateWishlistItemFormDataType>({
        resolver: zodResolver(createWishlistItemFormSchema),
        defaultValues: {
            name: "",
            description: "",
            price: undefined,
            image: undefined,
            link: "",
            priority: "normal",
        }
    });

    useEffect(() => {
        if (openedWishlistItem) {
            formHook.reset({
                name: openedWishlistItem.name || "",
                description: openedWishlistItem.description || "",
                price: typeof openedWishlistItem.price === "number" &&
                    openedWishlistItem.price > 0
                    ? openedWishlistItem.price / 100
                    : undefined,
                image: undefined,
                link: openedWishlistItem.link || "",
                priority: openedWishlistItem.priority || "normal",
            });
        }
    }, [openedWishlistItem, formHook]);

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
                    {/* Modal component */}
                    <WishlistItemCardDetails wishlistItem={openedWishlistItem} />
                    <CreateWishlistItemButton />
                    <EmptyWishlist isEmpty={isEmpty} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"  >
                        <WishlistItemCardForm />
                        {initialWishlist
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
