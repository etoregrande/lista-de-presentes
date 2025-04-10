'use client'

import { CreateWishlistItemFormDataType, WishlistItem } from "@/types/wishlistItem";
import { FormProvider, useForm } from "react-hook-form";
import { WishlistItemCard } from "./Wishlist-item-card";
import { WishlistItemCardNew } from "./Wishlist-item-card-new";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWishlistItemFormSchema } from "@/schemas/wishlistItem";
import { EmptyWishlist } from "./Wishlist-empty";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Plus } from "lucide-react";
import { Session } from "@/lib/auth";
import { CopyWishlistButton } from "./Copy-wishlist-button";

interface WishlistProps {
    userId?: string,
    initialWishlist: WishlistItem[],
    session: Session
}

export function Wishlist({ initialWishlist, session }: WishlistProps) {
    const [newItem, setNewItem] = useState(false)
    const [wishlist, setWishlist] = useState<WishlistItem[]>(initialWishlist)
    const isEmpty = wishlist.length === 0;
    // const searchParams = useSearchParams()
    // const itemId = searchParams.get("item")

    const formHook = useForm<CreateWishlistItemFormDataType>({
        resolver: zodResolver(createWishlistItemFormSchema),
    });

    // useEffect(() => {
    //     if (itemId) {
    //         document.body.classList.add("overflow-hidden");
    //     } else {
    //         document.body.classList.remove("overflow-hidden");
    //     }

    //     return () => {
    //         document.body.classList.remove("overflow-hidden");
    //     };
    // }, [itemId]);

    const handleNewItem = () => {
        setNewItem(true)
    }

    return (
        <>
            <FormProvider {...formHook}>
                <Button
                    onClick={handleNewItem}
                    disabled={newItem}
                    size="lg"
                >
                    {newItem ?
                        'Criando...'
                        :
                        (<><Plus />Adicionar item</>)
                    }
                </Button>

                <CopyWishlistButton userId={session.user.id} />
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
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
            </FormProvider >
        </>
    );
}
