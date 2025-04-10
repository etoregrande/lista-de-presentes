'use client'

import { CreateWishlistItemFormDataType, WishlistItem } from "@/types/wishlistItem";
import { FormProvider, useForm } from "react-hook-form";
import { WishlistItemCard } from "./Wishlist-item-card";
import { WishlistItemCardNew } from "./Wishlist-item-card-new";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWishlistItemFormSchema } from "@/schemas/wishlistItem";
import { EmptyWishlist } from "./Wishlist-empty";
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
                <div className="flex justify-between items-end">
                    <CopyWishlistButton userId={session.user.id} />
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
                </div>
                <div className="bg-slate-100 rounded-3xl p-4">
                    <h2 className="block text-2xl font-bold px-4 pt-2 pb-4">Sua lista de presentes
                        <span className="block text-base font-semibold text-slate-500">
                            Aqui ficam todos os seus presentes cadastrados
                        </span>
                    </h2>
                    <EmptyWishlist
                        isEmpty={isEmpty}
                        newItem={newItem}
                    />
                    <div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2"
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
                </div>
            </FormProvider >
        </>
    );
}
