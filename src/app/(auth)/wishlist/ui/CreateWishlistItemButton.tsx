'use client'

import { Button } from "@/components/ui/button/button";
import { WishlistContext } from "@/app/(auth)/wishlist/context/WishlistContext";
import { getContext } from "../actions";

export const CreateWishlistItemButton = () => {
    const { newItem, setNewItem } = getContext(WishlistContext)

    const handleNewItem = () => {
        setNewItem(true)
    }


    return (
        <>
            <Button onClick={handleNewItem} disabled={newItem}>{newItem ? 'Criando...' : '+ Novo Item'}</Button>
        </>
    )
}