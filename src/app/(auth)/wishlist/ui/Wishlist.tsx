'use client'

import { CreateWishlistItemFormDataType, WishlistItem } from "@/types/wishlistItem";
import { FormProvider, useForm } from "react-hook-form";
import { WishlistItemCard } from "./Wishlist-item-card";
import { WishlistItemCardNew } from "./Wishlist-item-card-new";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWishlistItemFormSchema } from "@/schemas/wishlistItem";
import { EmptyWishlist } from "./Wishlist-empty";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button/button";

interface WishlistProps {
    userId?: string,
    initialWishlist: WishlistItem[]
}

export function Wishlist({ initialWishlist }: WishlistProps) {
    const [newItem, setNewItem] = useState(false)
    const [wishlist, setWishlist] = useState<WishlistItem[]>(initialWishlist)
    const searchParams = useSearchParams()
    const itemId = searchParams.get("item")
    const isEmpty = wishlist.length === 0;

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

    const handleNewItem = () => {
        setNewItem(true)
    }

    return (
        <>
            <FormProvider {...formHook}>
                <Button
                    onClick={handleNewItem}
                    disabled={newItem}>
                    {newItem ? 'Criando...' : '+ Novo Item'}
                </Button>
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    <WishlistItemCardNew
                        isOpen={newItem}
                        setIsOpen={setNewItem}
                        setWishlist={setWishlist}
                    />
                    {wishlist
                        .slice()
                        .reverse()
                        .map((wishlistItem) =>
                            <WishlistItemCard
                                key={wishlistItem.id}
                                wishlistItem={wishlistItem}
                                mode="edit"
                                setWishlist={setWishlist}
                            />
                        )}
                </div>
                <EmptyWishlist
                    isEmpty={isEmpty}
                    newItem={newItem} />
            </FormProvider>
        </>
    );
}
