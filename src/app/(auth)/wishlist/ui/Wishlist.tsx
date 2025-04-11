'use client'

import { CreateWishlistItemFormDataType, WishlistItem } from "@/types/wishlistItem";
import { FormProvider, useForm } from "react-hook-form";
import { WishlistItemCard } from "./Wishlist-item-card";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWishlistItemFormSchema } from "@/schemas/wishlistItem";
import { EmptyWishlist } from "./Wishlist-empty";
import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Plus } from "lucide-react";
import { Session } from "@/lib/auth";
import { CopyWishlistButton } from "./Copy-wishlist-button";
import { motion, AnimatePresence } from "framer-motion"

interface WishlistProps {
    userId?: string,
    initialWishlist: WishlistItem[],
    session: Session
}

export function Wishlist({ initialWishlist, session }: WishlistProps) {
    const formHook = useForm<CreateWishlistItemFormDataType>({
        resolver: zodResolver(createWishlistItemFormSchema),
    });
    const [newItem, setNewItem] = useState(false)
    const [wishlist, setWishlist] = useState<WishlistItem[]>(initialWishlist)
    const isEmpty = wishlist.length === 0;

    const handleNewItem = () => {
        setNewItem(true)
        setWishlist((prev) => [
            ...prev,
            {
                id: "new",
                name: "",
                is_active: true,
                is_purchased: false,
                user_id: session.user.id,
                priority: "normal"
            },
        ])
    }

    return (
        <>
            <FormProvider {...formHook}>
                <div className="flex justify-end items-end gap-2 px-4 lg:px-0 pb-2">
                    <CopyWishlistButton userId={session.user.id} />
                    <Button
                        type="button"
                        onClick={handleNewItem}
                        disabled={newItem}
                    >
                        {newItem ?
                            'Criando...'
                            :
                            (<><Plus />Adicionar item</>)
                        }
                    </Button>
                </div>
                <div className="bg-slate-100 rounded-3xl p-4 mx-4 lg:mx-0 md:p-8">
                    <h2 className="block text-2xl font-bold pb-8 md:pt-0">Sua lista de presentes
                        <span className="block text-base font-normal text-slate-500">
                            Aqui ficam todos os seus presentes cadastrados
                        </span>
                    </h2>
                    <EmptyWishlist
                        isEmpty={isEmpty}
                        newItem={newItem}
                    />
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    >
                        <AnimatePresence initial={false}>
                            {wishlist
                                .slice()
                                .reverse()
                                .map((item) =>
                                    <WishlistItemCard
                                        key={item.id}
                                        wishlistItem={item}
                                        setNewItem={setNewItem}
                                        setWishlist={setWishlist}
                                        mode={item.id === "new" ?
                                            "new"
                                            :
                                            "edit"
                                        }
                                    />
                                )
                            }
                        </AnimatePresence>
                    </motion.div>
                </div>
            </FormProvider >
        </>
    );
}
